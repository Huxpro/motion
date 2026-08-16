import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
} from "react"
import {
    API_METRICS,
    ATOMIC_CAPABILITIES,
    CONVERGENCE_HISTORY,
    CONFORMANCE_CASES,
    CONFORMANCE_METRICS,
    GALLERY_EXAMPLES,
    PRIORITIZED_GAPS,
    WEIGHTED_LOSS,
    type SupportStatus,
} from "../../src/conformance/cases.js"
import {
    applyAnchor,
    captureAnchor,
    cardIdFromEvent,
    connectPane,
    dispatchTouchTap,
    scenarioCardId,
    triggerCard,
    type PaneHandle,
} from "./compare.js"
import {
    currentLang,
    localizedHref,
    makeT,
    type Lang,
    type Translate,
} from "./i18n.js"
import {
    MOTION_DOCS_HOME,
    motionDocsUrl,
    UPSTREAM_REPO_URL,
    upstreamSourceUrl,
} from "./motion-links.js"
import "./portal.css"

type View = "overview" | "examples" | "api" | "conformance"

const VIEWS: readonly View[] = ["overview", "examples", "api", "conformance"]

const NAV_KEYS = {
    overview: "nav.overview",
    examples: "nav.examples",
    api: "nav.api",
    conformance: "nav.conformance",
} as const

function currentView(): View {
    const candidate = new URLSearchParams(window.location.search).get("view")
    return VIEWS.includes(candidate as View) ? (candidate as View) : "overview"
}

function StatusMark({
    status,
    t,
}: {
    status: SupportStatus
    t: Translate
}) {
    return (
        <span className={`status-mark status-${status}`}>
            <span aria-hidden="true" className="status-dot" />
            {t(`status.${status}`)}
        </span>
    )
}

function Masthead({
    view,
    lang,
    t,
}: {
    view: View
    lang: Lang
    t: Translate
}) {
    const otherLang: Lang = lang === "zh" ? "en" : "zh"
    // The toggle always carries an explicit lang so it overrides the
    // persisted preference; plain view links inherit it instead.
    const toggleParams = new URLSearchParams({ view, lang: otherLang })
    return (
        <header className="masthead">
            <a
                className="wordmark"
                href={localizedHref(lang, { view: "overview" })}
                aria-label={t("masthead.label")}
            >
                <span className="wordmark-motion">Motion</span>
                <span className="wordmark-cross">/</span>
                <span className="wordmark-lynx">Lynx</span>
            </a>
            <nav className="nav" aria-label={t("nav.label")}>
                {VIEWS.map((item) => (
                    <a
                        key={item}
                        className={
                            view === item
                                ? "nav-link nav-link-active"
                                : "nav-link"
                        }
                        href={localizedHref(lang, { view: item })}
                    >
                        {t(NAV_KEYS[item])}
                    </a>
                ))}
            </nav>
            <div className="masthead-actions">
                <a
                    className="lang-toggle"
                    href={`?${toggleParams.toString()}`}
                    lang={otherLang === "zh" ? "zh-Hans" : "en"}
                    aria-label={t("lang.toggleLabel")}
                >
                    {t("lang.toggle")}
                </a>
                <a
                    className="build-stamp"
                    href="https://github.com/lynx-family/lynx-stack/pull/3477"
                    target="_blank"
                    rel="noreferrer"
                >
                    {t("masthead.stack")}
                </a>
            </div>
        </header>
    )
}

function CoverageStrip() {
    const supportedWidth = `${
        (API_METRICS.supported / API_METRICS.total) * 100
    }%`
    const partialWidth = `${(API_METRICS.partial / API_METRICS.total) * 100}%`
    const blockedWidth = `${(API_METRICS.blocked / API_METRICS.total) * 100}%`
    return (
        <div
            className="coverage-strip"
            aria-label="Atomic API support distribution"
        >
            <div
                className="coverage-supported"
                style={{ width: supportedWidth }}
            />
            <div className="coverage-partial" style={{ width: partialWidth }} />
            <div className="coverage-blocked" style={{ width: blockedWidth }} />
        </div>
    )
}

function EvidenceMark({
    available,
    label,
    t,
}: {
    available: boolean
    label: string
    t: Translate
}) {
    return (
        <span
            className={
                available
                    ? "monitor-evidence evidence-available"
                    : "monitor-evidence evidence-missing"
            }
            aria-label={`${label}: ${available ? "available" : "missing"}`}
        >
            <i aria-hidden="true" />
            {available ? t("mark.yes") : "—"}
        </span>
    )
}

function recordLabel(record: (typeof CONVERGENCE_HISTORY)[number]) {
    const labels = []
    if (record.lynxStackPr) labels.push(`L#${record.lynxStackPr}`)
    if (record.motionPr) labels.push(`M#${record.motionPr}`)
    if (record.issue) labels.push(`I#${record.issue}`)
    return labels.join(" / ")
}

function recordHref(record: (typeof CONVERGENCE_HISTORY)[number]) {
    if (record.lynxStackPr) {
        return `https://github.com/lynx-family/lynx-stack/pull/${record.lynxStackPr}`
    }
    if (record.issue) {
        return `https://github.com/Huxpro/motion/issues/${record.issue}`
    }
    return `https://github.com/Huxpro/motion/pull/${record.motionPr}`
}

function LossMonitor({ lang, t }: { lang: Lang; t: Translate }) {
    const width = 960
    const height = 268
    const left = 52
    const right = 28
    const top = 24
    const bottom = 62
    const expectedSpace = 112
    const plotHeight = height - top - bottom
    const x = (index: number) =>
        left +
        (index / Math.max(1, CONVERGENCE_HISTORY.length - 1)) *
            (width - left - right - expectedSpace)
    const y = (loss: number) => top + ((100 - loss) / 100) * plotHeight
    const points = CONVERGENCE_HISTORY.map(
        (record, index) => `${x(index)},${y(record.lossAfter)}`
    ).join(" ")
    // Label only loss change-points with breathing room, so a long history
    // stays readable; the full ledger carries the per-record detail.
    const lastIndex = CONVERGENCE_HISTORY.length - 1
    const labeled: number[] = []
    CONVERGENCE_HISTORY.forEach((record, index) => {
        const changed =
            index === 0 ||
            record.lossAfter !== CONVERGENCE_HISTORY[index - 1].lossAfter
        if (!changed && index !== lastIndex) return
        if (
            labeled.length &&
            x(index) - x(labeled[labeled.length - 1]) < 52
        ) {
            if (index !== lastIndex) return
            labeled.pop()
        }
        labeled.push(index)
    })
    const labelSet = new Set(labeled)
    const pending = [...CONVERGENCE_HISTORY]
        .reverse()
        .find((record) => record.expectedLossAfter !== undefined)
    const pendingIndex = pending ? CONVERGENCE_HISTORY.indexOf(pending) : -1
    const expectedX = width - right

    return (
        <section className="loss-monitor" aria-labelledby="loss-heading">
            <header className="monitor-section-header loss-monitor-header">
                <div>
                    <h2 id="loss-heading">{t("loss.title")}</h2>
                    <p>{t("loss.desc")}</p>
                </div>
                <strong>{WEIGHTED_LOSS}</strong>
            </header>
            <div className="loss-chart-wrap">
                <svg
                    className="loss-chart"
                    viewBox={`0 0 ${width} ${height}`}
                    role="img"
                    aria-label={t(
                        "loss.chartLabel",
                        WEIGHTED_LOSS,
                        CONVERGENCE_HISTORY.length
                    )}
                >
                    {[100, 75, 50, 25, 0].map((tick) => (
                        <g key={tick}>
                            <line
                                className="loss-grid-line"
                                x1={left}
                                x2={width - right}
                                y1={y(tick)}
                                y2={y(tick)}
                            />
                            <text
                                className="loss-axis-label"
                                x={left - 12}
                                y={y(tick) + 4}
                                textAnchor="end"
                            >
                                {tick}
                            </text>
                        </g>
                    ))}
                    <polyline className="loss-line" points={points} />
                    {CONVERGENCE_HISTORY.map((record, index) => (
                        <g key={record.id}>
                            <a
                                href={`${localizedHref(lang, {
                                    view: "conformance",
                                    sub: "history",
                                })}#rec-${record.id}`}
                                aria-label={`${recordLabel(record)} · ${
                                    record.title
                                } — ${t("loss.pointLabel")}`}
                            >
                                <circle
                                    className="loss-hit"
                                    cx={x(index)}
                                    cy={y(record.lossAfter)}
                                    r="10"
                                />
                                <circle
                                    className="loss-point"
                                    cx={x(index)}
                                    cy={y(record.lossAfter)}
                                    r={labelSet.has(index) ? 5 : 3}
                                />
                                <title>
                                    {`${recordLabel(record)} · ${record.title} · ${record.lossBefore} → ${record.lossAfter}`}
                                </title>
                            </a>
                            {labelSet.has(index) && (
                                <>
                                    <text
                                        className="loss-value"
                                        x={x(index)}
                                        y={y(record.lossAfter) - 12}
                                        textAnchor="middle"
                                    >
                                        {record.lossAfter}
                                    </text>
                                    <text
                                        className="loss-pr-label"
                                        x={x(index)}
                                        y={height - 28}
                                        textAnchor="middle"
                                    >
                                        {recordLabel(record)}
                                    </text>
                                </>
                            )}
                        </g>
                    ))}
                    {pending?.expectedLossAfter !== undefined && (
                        <g>
                            <line
                                className="loss-projection"
                                x1={x(pendingIndex)}
                                x2={expectedX}
                                y1={y(pending.lossAfter)}
                                y2={y(pending.expectedLossAfter)}
                            />
                            <circle
                                className="loss-point-projected"
                                cx={expectedX}
                                cy={y(pending.expectedLossAfter)}
                                r="6"
                            />
                            <text
                                className="loss-value loss-value-projected"
                                x={expectedX}
                                y={y(pending.expectedLossAfter) - 13}
                                textAnchor="middle"
                            >
                                {pending.expectedLossAfter} {t("loss.pending")}
                            </text>
                            <text
                                className="loss-pr-label"
                                x={expectedX}
                                y={height - 28}
                                textAnchor="middle"
                            >
                                {t("loss.verified")}
                            </text>
                        </g>
                    )}
                </svg>
            </div>
            <div className="recent-steps">
                <header>
                    <h3>{t("loss.recentTitle")}</h3>
                    <a
                        href={localizedHref(lang, {
                            view: "conformance",
                            sub: "history",
                        })}
                    >
                        {t("loss.history")}
                    </a>
                </header>
                <ol>
                    {[...CONVERGENCE_HISTORY]
                        .slice(-4)
                        .reverse()
                        .map((record) => (
                            <li className="recent-step" key={record.id}>
                                <a
                                    href={`${localizedHref(lang, {
                                        view: "conformance",
                                        sub: "history",
                                    })}#rec-${record.id}`}
                                >
                                    <span>{recordLabel(record)}</span>
                                    <strong>{record.title}</strong>
                                    <small>
                                        <i
                                            className={`record-status status-${record.status}`}
                                        >
                                            {t(`record.${record.status}`)}
                                        </i>
                                        <b>
                                            {record.lossBefore} →{" "}
                                            {record.lossAfter}
                                            {record.expectedLossAfter !==
                                                undefined &&
                                                ` → ${record.expectedLossAfter}?`}
                                        </b>
                                    </small>
                                </a>
                            </li>
                        ))}
                </ol>
            </div>
        </section>
    )
}

function Overview({ lang, t }: { lang: Lang; t: Translate }) {
    const implementationPercent = Math.round(
        ((API_METRICS.supported + API_METRICS.partial) / API_METRICS.total) *
            100
    )
    const exactPercent = Math.round(
        (CONFORMANCE_METRICS.conformant / CONFORMANCE_METRICS.tracked) * 100
    )
    const galleryPercent = Math.round(
        (CONFORMANCE_METRICS.gallery / CONFORMANCE_METRICS.tracked) * 100
    )
    const packageTestCount = CONFORMANCE_CASES.filter(
        (item) => item.evidence.packageTest
    ).length
    const packageTestPercent = Math.round(
        (packageTestCount / CONFORMANCE_METRICS.tracked) * 100
    )
    const nativePercent = Math.round(
        (CONFORMANCE_METRICS.native / CONFORMANCE_METRICS.tracked) * 100
    )
    const groups = Array.from(
        new Set(ATOMIC_CAPABILITIES.map((item) => item.group))
    ).map((group) => {
        const items = ATOMIC_CAPABILITIES.filter((item) => item.group === group)
        return {
            group,
            total: items.length,
            supported: items.filter((item) => item.status === "supported")
                .length,
            partial: items.filter((item) => item.status === "partial").length,
            blocked: items.filter((item) => item.status === "blocked").length,
        }
    })
    const blockers = ATOMIC_CAPABILITIES.filter(
        (item) => item.status === "blocked"
    )

    return (
        <main className="page overview-page" id="main-content">
            <header className="monitor-header">
                <div className="monitor-title">
                    <h1>{t("overview.title")}</h1>
                    <p>
                        <span>main</span>
                        <span aria-hidden="true"> → </span>
                        <a
                            href="https://github.com/lynx-family/lynx-stack/pull/3477"
                            target="_blank"
                            rel="noreferrer"
                        >
                            #3477
                        </a>
                        <span aria-hidden="true"> → </span>
                        <a
                            href="https://github.com/lynx-family/lynx-stack/pull/3509"
                            target="_blank"
                            rel="noreferrer"
                        >
                            #3509
                        </a>
                        <span aria-hidden="true"> → </span>
                        <a
                            href="https://github.com/lynx-family/lynx-stack/pull/3515"
                            target="_blank"
                            rel="noreferrer"
                        >
                            #3515–#3524
                        </a>{" "}
                        {t("overview.stackedPost")}
                    </p>
                </div>
                <div className="monitor-verdict">
                    <span className="monitor-verdict-label">
                        {t("overview.verdictLabel")}
                    </span>
                    <strong>{t("overview.verdict")}</strong>
                    <span>{t("overview.versions")}</span>
                </div>
            </header>

            <section
                className="monitor-metrics"
                aria-label={t("overview.metricsLabel")}
            >
                <a
                    className="monitor-metric"
                    href={localizedHref(lang, { view: "api" })}
                >
                    <span>{t("metric.apiReadiness")}</span>
                    <strong>
                        {API_METRICS.supported + API_METRICS.partial} /{" "}
                        {API_METRICS.total}
                    </strong>
                    <small>
                        {t("metric.apiReadinessNote", implementationPercent)}
                    </small>
                    <i style={{ width: `${implementationPercent}%` }} />
                </a>
                <a
                    className="monitor-metric"
                    href={localizedHref(lang, { view: "conformance" })}
                >
                    <span>{t("metric.exactParity")}</span>
                    <strong>
                        {CONFORMANCE_METRICS.conformant} /{" "}
                        {CONFORMANCE_METRICS.tracked}
                    </strong>
                    <small>{t("metric.exactParityNote", exactPercent)}</small>
                    <i style={{ width: `${Math.max(3, exactPercent)}%` }} />
                </a>
                <a
                    className="monitor-metric"
                    href={localizedHref(lang, { view: "conformance" })}
                >
                    <span>{t("metric.packageEvidence")}</span>
                    <strong>
                        {packageTestCount} / {CONFORMANCE_METRICS.tracked}
                    </strong>
                    <small>
                        {t("metric.packageEvidenceNote", packageTestPercent)}
                    </small>
                    <i style={{ width: `${packageTestPercent}%` }} />
                </a>
                <a
                    className="monitor-metric"
                    href={localizedHref(lang, { view: "examples" })}
                >
                    <span>{t("metric.galleryRunnable")}</span>
                    <strong>
                        {CONFORMANCE_METRICS.gallery} /{" "}
                        {CONFORMANCE_METRICS.tracked}
                    </strong>
                    <small>
                        {t("metric.galleryRunnableNote", galleryPercent)}
                    </small>
                    <i style={{ width: `${galleryPercent}%` }} />
                </a>
                <a
                    className="monitor-metric"
                    href={localizedHref(lang, { view: "conformance" })}
                >
                    <span>{t("metric.weightedLoss")}</span>
                    <strong>{WEIGHTED_LOSS}</strong>
                    <small>{t("metric.weightedLossNote")}</small>
                    <i style={{ width: `${100 - WEIGHTED_LOSS}%` }} />
                </a>
                <a
                    className="monitor-metric"
                    href={localizedHref(lang, { view: "conformance" })}
                >
                    <span>{t("metric.nativeEvidence")}</span>
                    <strong>
                        {CONFORMANCE_METRICS.native} /{" "}
                        {CONFORMANCE_METRICS.tracked}
                    </strong>
                    <small>{t("metric.nativeEvidenceNote", nativePercent)}</small>
                    <i style={{ width: `${Math.max(3, nativePercent)}%` }} />
                </a>
            </section>

            <LossMonitor lang={lang} t={t} />

            <section
                className="validation-gates"
                aria-labelledby="validation-heading"
            >
                <header className="monitor-section-header">
                    <div>
                        <h2 id="validation-heading">
                            {t("validation.title")}
                        </h2>
                        <p>{t("validation.desc")}</p>
                    </div>
                    <span>{t("validation.date")}</span>
                </header>
                <div className="validation-grid">
                    <article>
                        <span className="gate-status gate-pass">
                            {t("validation.pass")}
                        </span>
                        <strong>{t("validation.package")}</strong>
                        <b>134 / 134</b>
                        <p>{t("validation.packageNote")}</p>
                    </article>
                    <article>
                        <span className="gate-status gate-pass">
                            {t("validation.pass")}
                        </span>
                        <strong>{t("validation.headless")}</strong>
                        <b>5 / 5</b>
                        <p>{t("validation.headlessNote")}</p>
                    </article>
                    <article>
                        <span className="gate-status gate-blocked">
                            {t("validation.blocked")}
                        </span>
                        <strong>{t("validation.native")}</strong>
                        <b>SDK 0.0.1</b>
                        <p>{t("validation.nativeNote")}</p>
                    </article>
                </div>
            </section>

            <section className="monitor-split">
                <article className="capability-monitor">
                    <header className="monitor-section-header">
                        <h2>{t("areas.title")}</h2>
                        <a href={localizedHref(lang, { view: "api" })}>
                            {t("areas.open")}
                        </a>
                    </header>
                    <div
                        className="capability-table"
                        role="table"
                        aria-label={t("areas.tableLabel")}
                    >
                        <div
                            className="capability-row capability-row-head"
                            role="row"
                        >
                            <span role="columnheader">{t("areas.area")}</span>
                            <span role="columnheader">
                                {t("areas.supported")}
                            </span>
                            <span role="columnheader">{t("areas.partial")}</span>
                            <span role="columnheader">{t("areas.blocked")}</span>
                            <span role="columnheader">
                                {t("areas.distribution")}
                            </span>
                        </div>
                        {groups.map((group) => (
                            <div
                                className="capability-row"
                                role="row"
                                key={group.group}
                            >
                                <strong role="cell">{group.group}</strong>
                                <span role="cell">{group.supported}</span>
                                <span role="cell">{group.partial}</span>
                                <span role="cell">{group.blocked}</span>
                                <div
                                    className="group-distribution"
                                    role="cell"
                                    aria-label={`${group.group}: ${group.supported} supported, ${group.partial} partial, ${group.blocked} blocked`}
                                >
                                    <i
                                        className="group-supported"
                                        style={{
                                            width: `${
                                                (group.supported /
                                                    group.total) *
                                                100
                                            }%`,
                                        }}
                                    />
                                    <i
                                        className="group-partial"
                                        style={{
                                            width: `${
                                                (group.partial / group.total) *
                                                100
                                            }%`,
                                        }}
                                    />
                                    <i
                                        className="group-blocked"
                                        style={{
                                            width: `${
                                                (group.blocked / group.total) *
                                                100
                                            }%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <aside className="blocker-monitor">
                    <header className="monitor-section-header">
                        <h2>{t("gaps.title")}</h2>
                        <span>{t("gaps.blockers", blockers.length)}</span>
                    </header>
                    <ol className="priority-list">
                        {PRIORITIZED_GAPS.slice(0, 5).map((item, index) => (
                            <li key={item.case.id}>
                                <span>
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <div>
                                    {item.priority.issue ? (
                                        <a
                                            href={item.priority.issue}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {item.case.title}
                                        </a>
                                    ) : (
                                        <strong>{item.case.title}</strong>
                                    )}
                                    <small>
                                        I{item.priority.importance} · F
                                        {item.priority.platformFit} · M
                                        {item.priority.mts} · R
                                        {item.priority.reactLynx} · C
                                        {item.priority.css}
                                    </small>
                                </div>
                                <b>{item.score.toFixed(1)}</b>
                            </li>
                        ))}
                    </ol>
                </aside>
            </section>

            <section className="gallery-showoff">
                <h2>{t("showoff.title", GALLERY_EXAMPLES.length)}</h2>
                <p>{t("showoff.desc")}</p>
                <a href={localizedHref(lang, { view: "examples" })}>
                    {t("showoff.cta")}
                </a>
            </section>
        </main>
    )
}

function ApiChips({ apis }: { apis: readonly string[] }) {
    return (
        <code className="api-chips">
            {apis.map((api, index) => {
                const docs = motionDocsUrl(api)
                return (
                    <span key={`${api}-${index}`}>
                        {index > 0 && " · "}
                        {docs ? (
                            <a
                                className="api-chip-link"
                                href={docs}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {api}
                            </a>
                        ) : (
                            api
                        )}
                    </span>
                )
            })}
        </code>
    )
}

type PaneSide = "web" | "lynx"
type LinkState = "connecting" | "linked" | "unavailable"
type CompareLayout = "split" | "overlay"

function Examples({ lang, t }: { lang: Lang; t: Translate }) {
    // Prod uses the extensionless path: cleanUrls 308-redirects
    // /lynx/index.html → /lynx, and Safari refuses redirects inside a
    // COEP frame ("Redirection was blocked by Cross-Origin-Embedder-
    // Policy"); /lynx hits the rewrite directly with no redirect.
    const lynxUrl = import.meta.env.DEV
        ? "http://localhost:3000/__web_preview?casename=main.web.bundle"
        : "./lynx"
    const webUrl = "?mode=baseline"

    const stageRef = useRef<HTMLElement>(null)
    const webFrame = useRef<HTMLIFrameElement>(null)
    const lynxFrame = useRef<HTMLIFrameElement>(null)
    const panes = useRef<Record<PaneSide, PaneHandle | null>>({
        web: null,
        lynx: null,
    })
    const drivenUntil = useRef<Record<PaneSide, number>>({ web: 0, lynx: 0 })
    const mirrorGuardUntil = useRef(0)

    const [linkState, setLinkState] = useState<LinkState>("connecting")
    const [syncScroll, setSyncScroll] = useState(true)
    const [mirrorTaps, setMirrorTaps] = useState(true)
    const [layout, setLayout] = useState<CompareLayout>(() =>
        window.matchMedia("(max-width: 980px)").matches ? "overlay" : "split"
    )
    const [reveal, setReveal] = useState(50)
    const [reloadTick, setReloadTick] = useState(0)
    const [activeScenario, setActiveScenario] = useState("")
    const [configOpen, setConfigOpen] = useState(false)

    const syncScrollRef = useRef(syncScroll)
    syncScrollRef.current = syncScroll
    const mirrorTapsRef = useRef(mirrorTaps)
    mirrorTapsRef.current = mirrorTaps

    const lynxSameOrigin = useMemo(() => {
        try {
            return (
                new URL(lynxUrl, window.location.href).origin ===
                window.location.origin
            )
        } catch {
            return false
        }
    }, [lynxUrl])

    useEffect(() => {
        panes.current = { web: null, lynx: null }
        if (!lynxSameOrigin) {
            setLinkState("unavailable")
            return
        }
        setLinkState("connecting")
        let disposed = false
        let timer: ReturnType<typeof setTimeout> | undefined
        const cleanups: (() => void)[] = []
        const startedAt = performance.now()

        const wire = (side: PaneSide, other: PaneSide) => {
            const frame = side === "web" ? webFrame.current : lynxFrame.current
            if (!frame) return false
            const pane = connectPane(frame)
            if (!pane) return false
            panes.current[side] = pane

            const onScroll = () => {
                if (!syncScrollRef.current) return
                if (performance.now() < drivenUntil.current[side]) return
                requestAnimationFrame(() => {
                    const from = panes.current[side]
                    const to = panes.current[other]
                    if (!from || !to || !syncScrollRef.current) return
                    const anchor = captureAnchor(from)
                    if (!anchor) return
                    drivenUntil.current[other] = performance.now() + 180
                    applyAnchor(to, anchor)
                })
            }
            pane.scroller.addEventListener("scroll", onScroll, {
                passive: true,
            })

            const onTap = (event: Event) => {
                if (!mirrorTapsRef.current) return
                if (performance.now() < mirrorGuardUntil.current) return
                const cardId = cardIdFromEvent(event)
                const to = panes.current[other]
                if (!cardId || !to) return
                mirrorGuardUntil.current = performance.now() + 250
                triggerCard(to, cardId)
            }
            pane.doc.addEventListener("click", onTap, true)

            cleanups.push(() => {
                pane.scroller.removeEventListener("scroll", onScroll)
                pane.doc.removeEventListener("click", onTap, true)
            })

            if (side === "lynx") {
                // Desktop tap adapter: Lynx for Web recognises motion
                // gestures (whileTap) from touch sequences only, so a mouse
                // click alone cannot press them. Re-dispatch a synthetic
                // touch tap for real mouse/pen clicks; real touch input
                // already produced the touch sequence natively, so it is
                // excluded to avoid double-firing.
                let lastRealTouch = 0
                const onNativeTouch = (event: Event) => {
                    if (event.isTrusted) lastRealTouch = performance.now()
                }
                const onAdaptClick = (event: Event) => {
                    if (!event.isTrusted) return
                    if ((event as PointerEvent).pointerType === "touch") return
                    if (performance.now() - lastRealTouch < 700) return
                    // instanceof fails across iframe realms; duck-type it.
                    const target = event.composedPath?.()[0] as
                        | Element
                        | undefined
                    if (typeof target?.getBoundingClientRect === "function") {
                        dispatchTouchTap(target)
                    }
                }
                pane.doc.addEventListener("touchstart", onNativeTouch, true)
                pane.doc.addEventListener("click", onAdaptClick, true)
                cleanups.push(() => {
                    pane.doc.removeEventListener(
                        "touchstart",
                        onNativeTouch,
                        true
                    )
                    pane.doc.removeEventListener("click", onAdaptClick, true)
                })
            }
            return true
        }

        const tryConnect = () => {
            if (disposed) return
            const webOk = !!panes.current.web || wire("web", "lynx")
            const lynxOk = !!panes.current.lynx || wire("lynx", "web")
            if (webOk && lynxOk) {
                setLinkState("linked")
                return
            }
            if (performance.now() - startedAt > 30000) {
                setLinkState("unavailable")
                return
            }
            timer = setTimeout(tryConnect, 350)
        }
        tryConnect()

        return () => {
            disposed = true
            if (timer) clearTimeout(timer)
            cleanups.forEach((dispose) => dispose())
        }
    }, [lynxSameOrigin, reloadTick, layout])

    const replayBoth = () => setReloadTick((tick) => tick + 1)

    const runScenario = (scenarioId: string) => {
        setActiveScenario(scenarioId)
        const cardId = scenarioCardId(scenarioId)
        stageRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
        })
        const sides: PaneSide[] = ["web", "lynx"]
        for (const side of sides) {
            const pane = panes.current[side]
            if (!pane) continue
            drivenUntil.current[side] = performance.now() + 600
            applyAnchor(pane, { id: cardId, fraction: -0.06 })
        }
        window.setTimeout(() => {
            mirrorGuardUntil.current = performance.now() + 400
            for (const side of sides) {
                const pane = panes.current[side]
                if (pane) triggerCard(pane, cardId)
            }
        }, 420)
    }

    const onHandleDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        const stage = stageRef.current
        if (!stage) return
        const handle = event.currentTarget
        handle.setPointerCapture(event.pointerId)
        const rect = stage.getBoundingClientRect()
        const move = (pointer: PointerEvent) => {
            const percent =
                ((pointer.clientX - rect.left) / rect.width) * 100
            setReveal(Math.min(94, Math.max(6, percent)))
        }
        const up = () => {
            handle.removeEventListener("pointermove", move)
            handle.removeEventListener("pointerup", up)
            handle.removeEventListener("pointercancel", up)
        }
        handle.addEventListener("pointermove", move)
        handle.addEventListener("pointerup", up)
        handle.addEventListener("pointercancel", up)
    }

    // Package identity lives inside each gallery's own header now (behind
    // the ⓘ toggle), so the pane bars stay minimal.
    const webPaneHeader = (
        <header>
            <span>{t("examples.webPane")}</span>
            <a href={webUrl} target="_blank" rel="noreferrer">
                {t("examples.open")}
            </a>
        </header>
    )
    const lynxPaneHeader = (
        <header>
            <span>{t("examples.lynxPane")}</span>
            <a href={lynxUrl} target="_blank" rel="noreferrer">
                {t("examples.open")}
            </a>
        </header>
    )
    const webIframe = (
        <iframe
            key={`web-${reloadTick}`}
            ref={webFrame}
            title={t("examples.webFrameTitle")}
            src={webUrl}
        />
    )
    const lynxIframe = (
        <iframe
            key={`lynx-${reloadTick}`}
            ref={lynxFrame}
            title={t("examples.lynxFrameTitle")}
            src={lynxUrl}
        />
    )

    return (
        <main className="page examples-page examples-app" id="main-content">
            <div
                className="compare-toolbar"
                role="toolbar"
                aria-label={t("compare.layoutLabel")}
            >
                <h1 className="compare-title">{t("examples.title")}</h1>
                <select
                    className="scenario-picker"
                    aria-label={t("scenarios.pickerLabel")}
                    value={activeScenario}
                    disabled={linkState !== "linked"}
                    onChange={(event) => {
                        if (event.target.value) runScenario(event.target.value)
                    }}
                >
                    <option value="">
                        {t(
                            "scenarios.pickerPlaceholder",
                            GALLERY_EXAMPLES.length
                        )}
                    </option>
                    {GALLERY_EXAMPLES.map((example, index) => (
                        <option key={example.id} value={example.id}>
                            {String(index + 1).padStart(2, "0")} ·{" "}
                            {example.title}
                        </option>
                    ))}
                </select>
                <button
                    className={
                        configOpen ? "config-toggle toggle-active" : "config-toggle"
                    }
                    aria-expanded={configOpen}
                    aria-label={t("compare.config")}
                    onClick={() => setConfigOpen((value) => !value)}
                >
                    ⚙
                </button>
                <div
                    className={
                        configOpen
                            ? "compare-config config-open"
                            : "compare-config"
                    }
                >
                    <div className="config-group">
                        <span className="config-label">
                            {t("compare.layoutLabel")}
                        </span>
                        <div className="compare-modes">
                            <button
                                className={
                                    layout === "split" ? "toggle-active" : ""
                                }
                                aria-pressed={layout === "split"}
                                onClick={() => setLayout("split")}
                            >
                                {t("compare.sideBySide")}
                            </button>
                            <button
                                className={
                                    layout === "overlay" ? "toggle-active" : ""
                                }
                                aria-pressed={layout === "overlay"}
                                onClick={() => setLayout("overlay")}
                            >
                                {t("compare.overlay")}
                            </button>
                        </div>
                    </div>
                    <div className="config-group">
                        <span className="config-label">
                            {t("compare.bridgeLabel")}
                        </span>
                        <div className="compare-switches">
                            <button
                                className={
                                    syncScroll
                                        ? "switch-row toggle-active"
                                        : "switch-row"
                                }
                                aria-pressed={syncScroll}
                                disabled={linkState === "unavailable"}
                                onClick={() =>
                                    setSyncScroll((value) => !value)
                                }
                            >
                                <span>{t("compare.syncScroll")}</span>
                                <i className="switch-knob" aria-hidden="true" />
                            </button>
                            <button
                                className={
                                    mirrorTaps
                                        ? "switch-row toggle-active"
                                        : "switch-row"
                                }
                                aria-pressed={mirrorTaps}
                                disabled={linkState === "unavailable"}
                                onClick={() =>
                                    setMirrorTaps((value) => !value)
                                }
                            >
                                <span>{t("compare.mirrorTaps")}</span>
                                <i className="switch-knob" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                    <button className="compare-replay" onClick={replayBoth}>
                        {t("compare.replay")}
                    </button>
                </div>
                <span
                    className={`compare-status compare-status-${linkState}`}
                    role="status"
                >
                    <i aria-hidden="true" />
                    <em>
                        {linkState === "linked"
                            ? t("compare.linked")
                            : linkState === "connecting"
                              ? t("compare.connecting")
                              : t("compare.unavailable")}
                    </em>
                </span>
            </div>

            <div className="compare-shell">
                <aside
                    className="scenario-rail"
                    aria-label={t("scenarios.title", GALLERY_EXAMPLES.length)}
                >
                    <header className="scenario-rail-header">
                        <h2>
                            {t("scenarios.title", GALLERY_EXAMPLES.length)}
                        </h2>
                    </header>
                    <ol className="scenario-list">
                        {GALLERY_EXAMPLES.map((example, index) => (
                            <li key={example.id}>
                                <button
                                    className={
                                        activeScenario === example.id
                                            ? "scenario-row scenario-active"
                                            : "scenario-row"
                                    }
                                    disabled={linkState !== "linked"}
                                    aria-label={t(
                                        "scenarios.runLabel",
                                        example.title
                                    )}
                                    onClick={() => runScenario(example.id)}
                                >
                                    <span className="scenario-number">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span className="scenario-copy">
                                        <strong>{example.title}</strong>
                                        {activeScenario === example.id && (
                                            <>
                                                <span className="scenario-summary">
                                                    {example.summary}
                                                </span>
                                                <ApiChips
                                                    apis={example.api}
                                                />
                                            </>
                                        )}
                                    </span>
                                    <i
                                        className={`evidence-dot evidence-${example.evidence}`}
                                        title={example.evidence}
                                        aria-hidden="true"
                                    />
                                </button>
                            </li>
                        ))}
                    </ol>
                </aside>

                <section
                    ref={stageRef}
                    className={`compare-stage compare-${layout}`}
                    aria-label={t("examples.sectionLabel")}
                >
                {layout === "split" ? (
                    <>
                        <article className="runtime-frame">
                            {webPaneHeader}
                            {webIframe}
                        </article>
                        <article className="runtime-frame runtime-frame-lynx">
                            {lynxPaneHeader}
                            {lynxIframe}
                        </article>
                    </>
                ) : (
                    <div className="overlay-stage">
                        <article className="runtime-frame">
                            {webPaneHeader}
                            {webIframe}
                        </article>
                        <div
                            className="overlay-top"
                            style={{
                                clipPath: `inset(0 ${100 - reveal}% 0 0)`,
                            }}
                        >
                            <article className="runtime-frame runtime-frame-lynx">
                                {lynxPaneHeader}
                                {lynxIframe}
                            </article>
                        </div>
                        <div
                            className="overlay-handle"
                            style={{ left: `${reveal}%` }}
                            onPointerDown={onHandleDown}
                            role="slider"
                            aria-label={t("compare.dragHint")}
                            aria-valuenow={Math.round(reveal)}
                            aria-valuemin={6}
                            aria-valuemax={94}
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (event.key === "ArrowLeft") {
                                    setReveal((value) =>
                                        Math.max(6, value - 4)
                                    )
                                }
                                if (event.key === "ArrowRight") {
                                    setReveal((value) =>
                                        Math.min(94, value + 4)
                                    )
                                }
                            }}
                        >
                            <i aria-hidden="true" />
                        </div>
                        <span className="overlay-hint" aria-hidden="true">
                            {t("compare.dragHint")}
                        </span>
                    </div>
                )}
                </section>
            </div>
        </main>
    )
}

function ApiMatrix({ t }: { t: Translate }) {
    const [filter, setFilter] = useState<SupportStatus | "all">("all")
    const items = useMemo(
        () =>
            filter === "all"
                ? ATOMIC_CAPABILITIES
                : ATOMIC_CAPABILITIES.filter((item) => item.status === filter),
        [filter]
    )
    const groups = Array.from(new Set(items.map((item) => item.group)))

    return (
        <main className="page matrix-page" id="main-content">
            <header className="page-intro matrix-intro">
                <div>
                    <h1>{t("api.title")}</h1>
                </div>
                <div className="matrix-summary">
                    <CoverageStrip />
                    <p>
                        {t(
                            "api.summary",
                            API_METRICS.total,
                            API_METRICS.supported,
                            API_METRICS.partial,
                            API_METRICS.blocked
                        )}
                    </p>
                </div>
            </header>
            <div
                className="filter-bar"
                role="group"
                aria-label={t("api.filterLabel")}
            >
                {(["all", "supported", "partial", "blocked"] as const).map(
                    (status) => (
                        <button
                            key={status}
                            className={filter === status ? "filter-active" : ""}
                            onClick={() => setFilter(status)}
                        >
                            {status === "all"
                                ? t("api.all", API_METRICS.total)
                                : `${t(`status.${status}`)} ${API_METRICS[status]}`}
                        </button>
                    )
                )}
            </div>
            <div className="matrix-groups">
                {groups.map((group) => (
                    <section className="matrix-group" key={group}>
                        <h2>{group}</h2>
                        <div
                            className="matrix-table"
                            role="table"
                            aria-label={`${group} API support`}
                        >
                            {items
                                .filter((item) => item.group === group)
                                .map((item) => {
                                    const docs = motionDocsUrl(item.api)
                                    return (
                                        <div
                                            className="matrix-row"
                                            role="row"
                                            key={item.id}
                                        >
                                            <code role="cell">{item.api}</code>
                                            <div role="cell">
                                                <strong>{item.contract}</strong>
                                                {item.boundary && (
                                                    <p>{item.boundary}</p>
                                                )}
                                                {docs && (
                                                    <a
                                                        className="docs-link"
                                                        href={docs}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        aria-label={t(
                                                            "api.docsLabel",
                                                            item.api
                                                        )}
                                                    >
                                                        {t("api.docs")}
                                                    </a>
                                                )}
                                            </div>
                                            <StatusMark
                                                status={item.status}
                                                t={t}
                                            />
                                            <span
                                                className={`evidence-tag evidence-${item.evidence}`}
                                            >
                                                {item.evidence}
                                            </span>
                                        </div>
                                    )
                                })}
                        </div>
                    </section>
                ))}
            </div>
        </main>
    )
}

type ConformanceSub = "contracts" | "history"

function currentConformanceSub(): ConformanceSub {
    return new URLSearchParams(window.location.search).get("sub") === "history"
        ? "history"
        : "contracts"
}

function Conformance({ lang, t }: { lang: Lang; t: Translate }) {
    const exact = Math.round(
        (CONFORMANCE_METRICS.conformant / CONFORMANCE_METRICS.tracked) * 100
    )
    const sub = currentConformanceSub()

    // Deep links from the overview loss chart (#rec-*) land after React
    // renders, so the native anchor scroll never fired and :target was
    // computed against a not-yet-rendered element — do both by hand.
    useEffect(() => {
        const hash = window.location.hash.slice(1)
        if (!hash) return
        const row = document.getElementById(hash)
        if (!row) return
        row.classList.add("row-targeted")
        row.scrollIntoView({ block: "start" })
    }, [sub])

    return (
        <main className="page conformance-page" id="main-content">
            <header className="page-intro conformance-intro">
                <div>
                    <h1>{t("conformance.title")}</h1>
                </div>
                <div className="conformance-number">
                    <strong>{exact}%</strong>
                    <span>{t("conformance.exact")}</span>
                </div>
            </header>

            <nav className="sub-nav" aria-label={t("nav.conformance")}>
                <a
                    className={sub === "contracts" ? "sub-nav-active" : ""}
                    aria-current={sub === "contracts" ? "page" : undefined}
                    href={localizedHref(lang, { view: "conformance" })}
                >
                    {t("conformance.tabContracts")}
                    <b>{CONFORMANCE_METRICS.tracked}</b>
                </a>
                <a
                    className={sub === "history" ? "sub-nav-active" : ""}
                    aria-current={sub === "history" ? "page" : undefined}
                    href={localizedHref(lang, {
                        view: "conformance",
                        sub: "history",
                    })}
                >
                    {t("conformance.historyTitle")}
                    <b>{CONVERGENCE_HISTORY.length}</b>
                </a>
            </nav>

            {sub === "history" ? (
                <ConformanceHistory lang={lang} t={t} />
            ) : (
                <ConformanceContracts t={t} />
            )}
        </main>
    )
}

function ConformanceContracts({ t }: { t: Translate }) {
    const exact = Math.round(
        (CONFORMANCE_METRICS.conformant / CONFORMANCE_METRICS.tracked) * 100
    )
    return (
        <>
            <section
                className="coverage-ledger"
                aria-label={t("conformance.coverageLabel")}
            >
                <div>
                    <span>{t("conformance.tracked")}</span>
                    <strong>{CONFORMANCE_METRICS.tracked}</strong>
                    <small>100%</small>
                </div>
                <div>
                    <span>{t("conformance.conformant")}</span>
                    <strong>{CONFORMANCE_METRICS.conformant}</strong>
                    <small>{exact}%</small>
                </div>
                <div>
                    <span>{t("conformance.partialRunnable")}</span>
                    <strong>{CONFORMANCE_METRICS.partial}</strong>
                    <small>
                        {Math.round(
                            (CONFORMANCE_METRICS.partial /
                                CONFORMANCE_METRICS.tracked) *
                                100
                        )}
                        %
                    </small>
                </div>
                <div>
                    <span>{t("conformance.blocked")}</span>
                    <strong>{CONFORMANCE_METRICS.blocked}</strong>
                    <small>
                        {Math.round(
                            (CONFORMANCE_METRICS.blocked /
                                CONFORMANCE_METRICS.tracked) *
                                100
                        )}
                        %
                    </small>
                </div>
            </section>

            <p className="method-note">{t("conformance.method")}</p>

            <section
                className="case-list"
                aria-label={t("conformance.caseListLabel")}
            >
                {CONFORMANCE_CASES.map((item, index) => (
                    <article
                        className="case-row"
                        key={item.id}
                        id={`case-${item.id.replace("/", "-")}`}
                    >
                        <span className="case-index">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="case-main">
                            <div className="case-title-line">
                                <span>{item.category}</span>
                                <h2>{item.title}</h2>
                            </div>
                            <p>{item.summary}</p>
                            <ApiChips apis={item.api} />
                            <details>
                                <summary>
                                    {t("conformance.upstreamDetail")}
                                </summary>
                                <div className="case-detail">
                                    <p>
                                        <b>{item.upstream.sourceVersion}</b> ·{" "}
                                        <a
                                            href={upstreamSourceUrl(
                                                item.upstream.sourceVersion,
                                                item.upstream.path
                                            )}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {item.upstream.path}
                                        </a>
                                    </p>
                                    <p>“{item.upstream.testName}”</p>
                                    <ul>
                                        {item.assertions.map((assertion) => (
                                            <li key={assertion}>{assertion}</li>
                                        ))}
                                    </ul>
                                    {item.gap && (
                                        <p className="gap-copy">
                                            {t("conformance.gap")} {item.gap}
                                        </p>
                                    )}
                                    <a
                                        className="docs-link"
                                        href={upstreamSourceUrl(
                                            item.upstream.sourceVersion,
                                            item.upstream.path
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {t("conformance.viewSource")}
                                    </a>
                                </div>
                            </details>
                        </div>
                        <div className="case-status">
                            <StatusMark
                                status={
                                    item.status === "conformant"
                                        ? "supported"
                                        : item.status
                                }
                                t={t}
                            />
                            <div className="case-evidence">
                                <span>{t("evidence.package")}</span>
                                <EvidenceMark
                                    available={item.evidence.packageTest}
                                    label={t("evidence.package")}
                                    t={t}
                                />
                                <span>{t("evidence.gallery")}</span>
                                <EvidenceMark
                                    available={item.evidence.gallery}
                                    label={t("evidence.gallery")}
                                    t={t}
                                />
                                <span>{t("evidence.dual")}</span>
                                <EvidenceMark
                                    available={item.evidence.dualRenderer}
                                    label={t("evidence.dual")}
                                    t={t}
                                />
                                <span>{t("evidence.native")}</span>
                                <EvidenceMark
                                    available={item.evidence.native}
                                    label={t("evidence.native")}
                                    t={t}
                                />
                            </div>
                        </div>
                    </article>
                ))}
            </section>
        </>
    )
}

function ConformanceHistory({ lang, t }: { lang: Lang; t: Translate }) {
    return (
        <section className="convergence-monitor">
            <header className="monitor-section-header convergence-header">
                <div>
                    <p>{t("conformance.historyDesc")}</p>
                </div>
                <a href={localizedHref(lang, { view: "overview" })}>
                    {t("nav.overview")} →
                </a>
            </header>
            <ol className="convergence-ledger">
                {CONVERGENCE_HISTORY.map((record) => (
                    <li key={record.id} id={`rec-${record.id}`}>
                        <a
                            href={recordHref(record)}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {recordLabel(record)}
                        </a>
                        <div>
                            <strong>{record.title}</strong>
                            <p>{record.note}</p>
                        </div>
                        <span
                            className={`record-status status-${record.status}`}
                        >
                            {t(`record.${record.status}`)}
                        </span>
                        <b>
                            {record.lossBefore} → {record.lossAfter}
                            {record.expectedLossAfter !== undefined &&
                                ` → ${record.expectedLossAfter}?`}
                        </b>
                    </li>
                ))}
            </ol>
        </section>
    )
}

export function EvidencePortal() {
    const view = currentView()
    const lang = currentLang()
    const t = useMemo(() => makeT(lang), [lang])

    useEffect(() => {
        document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en"
    }, [lang])

    return (
        <div className={`site-shell view-${view}`}>
            <a className="skip-link" href="#main-content">
                {t("skip")}
            </a>
            <Masthead view={view} lang={lang} t={t} />
            {view === "overview" && <Overview lang={lang} t={t} />}
            {view === "examples" && <Examples lang={lang} t={t} />}
            {view === "api" && <ApiMatrix t={t} />}
            {view === "conformance" && <Conformance lang={lang} t={t} />}
            <footer className="footer">
                <span>{t("footer.snapshot")}</span>
                <div>
                    <a
                        href={MOTION_DOCS_HOME}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {t("footer.motionDocs")}
                    </a>
                    <a
                        href={`${UPSTREAM_REPO_URL}/tree/v12.40.0`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {t("footer.upstream")}
                    </a>
                    <a href="https://github.com/Huxpro/motion/blob/main/lynx/src/conformance/cases.ts">
                        {t("footer.manifest")}
                    </a>
                    <a href="https://github.com/Huxpro/motion/pull/103/checks">
                        {t("footer.checks")}
                    </a>
                </div>
            </footer>
        </div>
    )
}
