import { useMemo, useState } from "react"
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
import "./portal.css"

type View = "overview" | "examples" | "api" | "conformance"

const VIEW_LABELS: Record<View, string> = {
    overview: "Monitor",
    examples: "Gallery",
    api: "API",
    conformance: "Tests",
}

const STATUS_LABEL: Record<SupportStatus, string> = {
    supported: "Supported",
    partial: "Partial",
    blocked: "Blocked",
}

function currentView(): View {
    const candidate = new URLSearchParams(window.location.search).get("view")
    return candidate && candidate in VIEW_LABELS
        ? (candidate as View)
        : "overview"
}

function StatusMark({ status }: { status: SupportStatus }) {
    return (
        <span className={`status-mark status-${status}`}>
            <span aria-hidden="true" className="status-dot" />
            {STATUS_LABEL[status]}
        </span>
    )
}

function Masthead({ view }: { view: View }) {
    return (
        <header className="masthead">
            <a
                className="wordmark"
                href="?view=overview"
                aria-label="Motion on Lynx monitor"
            >
                <span className="wordmark-motion">Motion</span>
                <span className="wordmark-cross">/</span>
                <span className="wordmark-lynx">Lynx</span>
            </a>
            <nav className="nav" aria-label="Evidence views">
                {(Object.keys(VIEW_LABELS) as View[]).map((item) => (
                    <a
                        key={item}
                        className={
                            view === item
                                ? "nav-link nav-link-active"
                                : "nav-link"
                        }
                        href={`?view=${item}`}
                        aria-current={view === item ? "page" : undefined}
                    >
                        {VIEW_LABELS[item]}
                    </a>
                ))}
            </nav>
            <a
                className="build-stamp"
                href="https://github.com/lynx-family/lynx-stack/pull/3457"
                target="_blank"
                rel="noreferrer"
            >
                Stack #3457
            </a>
        </header>
    )
}

function EvidenceMark({
    available,
    label,
}: {
    available: boolean
    label: string
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
            {available ? "Yes" : "—"}
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

function ConvergenceRecord({
    record,
}: {
    record: (typeof CONVERGENCE_HISTORY)[number]
}) {
    return (
        <li>
            <a href={recordHref(record)} target="_blank" rel="noreferrer">
                {recordLabel(record)}
            </a>
            <div>
                <strong>{record.title}</strong>
                <p>{record.note}</p>
            </div>
            <span className={`record-status status-${record.status}`}>
                {record.status}
            </span>
            <b>
                {record.lossBefore} → {record.lossAfter}
                {record.expectedLossAfter !== undefined &&
                    ` → ${record.expectedLossAfter}?`}
            </b>
        </li>
    )
}

function LossMonitor() {
    const width = 960
    const height = 268
    const left = 52
    const right = 28
    const top = 24
    const bottom = 34
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
    const pending = [...CONVERGENCE_HISTORY]
        .reverse()
        .find((record) => record.expectedLossAfter !== undefined)
    const pendingIndex = pending ? CONVERGENCE_HISTORY.indexOf(pending) : -1
    const expectedX = width - right
    const recentRecords = [...CONVERGENCE_HISTORY].slice(-8).reverse()
    const earlierRecords = [...CONVERGENCE_HISTORY].slice(0, -8).reverse()

    return (
        <section className="loss-monitor" aria-labelledby="loss-heading">
            <header className="monitor-section-header loss-monitor-header">
                <div>
                    <h2 id="loss-heading">Weighted conformance loss</h2>
                    <p>
                        Importance-weighted semantic gap; partial = ½ loss,
                        blocked = full loss.
                    </p>
                </div>
                <strong>{WEIGHTED_LOSS}</strong>
            </header>
            <div className="loss-chart-wrap">
                <svg
                    className="loss-chart"
                    viewBox={`0 0 ${width} ${height}`}
                    role="img"
                    aria-label={`Weighted loss is ${WEIGHTED_LOSS} after ${CONVERGENCE_HISTORY.length} recorded PR steps`}
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
                            <title>
                                {recordLabel(record)} · {record.title} · loss{" "}
                                {record.lossAfter}
                            </title>
                            <circle
                                className="loss-point"
                                cx={x(index)}
                                cy={y(record.lossAfter)}
                                r="5"
                            />
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
                                {pending.expectedLossAfter} pending
                            </text>
                            <text
                                className="loss-pr-label"
                                x={expectedX}
                                y={height - 28}
                                textAnchor="middle"
                            >
                                verified
                            </text>
                        </g>
                    )}
                </svg>
            </div>
            <h3 className="history-heading">Recent changes</h3>
            <ol className="convergence-ledger">
                {recentRecords.map((record) => (
                    <ConvergenceRecord key={record.id} record={record} />
                ))}
            </ol>
            {earlierRecords.length > 0 && (
                <details className="history-archive">
                    <summary>
                        Show {earlierRecords.length} earlier records
                    </summary>
                    <ol className="convergence-ledger">
                        {earlierRecords.map((record) => (
                            <ConvergenceRecord
                                key={record.id}
                                record={record}
                            />
                        ))}
                    </ol>
                </details>
            )}
        </section>
    )
}

function Overview() {
    const implementationPercent = Math.round(
        ((API_METRICS.supported + API_METRICS.partial) / API_METRICS.total) *
            100
    )
    const exactPercent = Math.round(
        (CONFORMANCE_METRICS.conformant / CONFORMANCE_METRICS.tracked) * 100
    )

    return (
        <main className="page overview-page" id="main-content">
            <header className="monitor-header">
                <div className="monitor-title">
                    <h1>Motion / Lynx monitor</h1>
                    <p>
                        <a
                            href="https://github.com/lynx-family/lynx-stack/pull/3457"
                            target="_blank"
                            rel="noreferrer"
                        >
                            #3457
                        </a>{" "}
                        stacked on{" "}
                        <a
                            href="https://github.com/lynx-family/lynx-stack/pull/3455"
                            target="_blank"
                            rel="noreferrer"
                        >
                            #3455
                        </a>{" "}
                        · runtime baseline #3436
                    </p>
                </div>
                <div className="monitor-verdict">
                    <span className="monitor-verdict-label">
                        Current boundary
                    </span>
                    <strong>Useful subset, not drop-in compatible</strong>
                    <span>Upstream source 12.40.0 · Web baseline 13.0.0</span>
                </div>
            </header>

            <section
                className="monitor-metrics"
                aria-label="Current progress metrics"
            >
                <a className="monitor-metric" href="?view=api">
                    <span>API readiness</span>
                    <strong>
                        {API_METRICS.supported + API_METRICS.partial} /{" "}
                        {API_METRICS.total}
                    </strong>
                    <small>{implementationPercent}% supported or partial</small>
                </a>
                <a className="monitor-metric" href="?view=conformance">
                    <span>Exact conformance</span>
                    <strong>
                        {CONFORMANCE_METRICS.conformant} /{" "}
                        {CONFORMANCE_METRICS.tracked}
                    </strong>
                    <small>{exactPercent}% of the tracked upstream slice</small>
                </a>
            </section>

            <section className="priority-monitor">
                <header className="monitor-section-header">
                    <div>
                        <h2>Next gaps</h2>
                        <p>Ranked by usage value and implementation fit.</p>
                    </div>
                    <span>Priority score</span>
                </header>
                <ol className="priority-list">
                    {PRIORITIZED_GAPS.slice(0, 5).map((item, index) => (
                        <li key={item.case.id}>
                            <span>{String(index + 1).padStart(2, "0")}</span>
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
                                    Importance {item.priority.importance} ·
                                    platform fit {item.priority.platformFit} ·
                                    MTS {item.priority.mts} · ReactLynx{" "}
                                    {item.priority.reactLynx} · CSS{" "}
                                    {item.priority.css}
                                </small>
                            </div>
                            <b>{item.score.toFixed(1)}</b>
                        </li>
                    ))}
                </ol>
            </section>

            <LossMonitor />
        </main>
    )
}

function Examples() {
    const lynxUrl = import.meta.env.DEV
        ? "http://localhost:3000/__web_preview?casename=main.web.bundle"
        : "./lynx/index.html"

    return (
        <main className="page examples-page" id="main-content">
            <header className="page-intro split-intro">
                <div>
                    <h1>Runtime gallery</h1>
                </div>
                <p>
                    Web runs the locked upstream baseline. Lynx runs the #3436
                    adapter through Lynx for Web.
                </p>
            </header>

            <section
                className="comparison-grid"
                aria-label="Web and Lynx live examples"
            >
                <article className="runtime-frame">
                    <header>
                        <span>WEB REFERENCE</span>
                        <b>framer-motion@13.0.0</b>
                        <a
                            href="?mode=baseline"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Open ↗
                        </a>
                    </header>
                    <iframe title="Web Motion reference" src="?mode=baseline" />
                </article>
                <article className="runtime-frame runtime-frame-lynx">
                    <header>
                        <span>REACTLYNX</span>
                        <b>@lynx-js/motion · #3436</b>
                        <a href={lynxUrl} target="_blank" rel="noreferrer">
                            Open ↗
                        </a>
                    </header>
                    <iframe title="ReactLynx Motion preview" src={lynxUrl} />
                </article>
            </section>

            <section className="scenario-index">
                <div className="section-heading compact-heading">
                    <h2>Scenarios</h2>
                </div>
                <div className="scenario-list">
                    {GALLERY_EXAMPLES.map((example, index) => (
                        <article className="scenario-row" key={example.id}>
                            <span className="scenario-number">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <div>
                                <h3>{example.title}</h3>
                                <p>{example.summary}</p>
                            </div>
                            <code>{example.api.join(" · ")}</code>
                            <span
                                className={`evidence-tag evidence-${example.evidence}`}
                            >
                                {example.evidence}
                            </span>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    )
}

function ApiMatrix() {
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
                    <h1>API support</h1>
                </div>
            </header>
            <div
                className="filter-bar"
                role="group"
                aria-label="Filter API status"
            >
                {(["all", "supported", "partial", "blocked"] as const).map(
                    (status) => (
                        <button
                            key={status}
                            className={filter === status ? "filter-active" : ""}
                            onClick={() => setFilter(status)}
                        >
                            {status === "all"
                                ? `All ${API_METRICS.total}`
                                : `${STATUS_LABEL[status]} ${API_METRICS[status]}`}
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
                                .map((item) => (
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
                                        </div>
                                        <StatusMark status={item.status} />
                                        <span
                                            className={`evidence-tag evidence-${item.evidence}`}
                                        >
                                            {item.evidence}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </section>
                ))}
            </div>
        </main>
    )
}

function Conformance() {
    return (
        <main className="page conformance-page" id="main-content">
            <header className="page-intro conformance-intro">
                <div>
                    <h1>Conformance suites</h1>
                </div>
                <p>
                    Source-linked declarative contracts selected for Lynx
                    convergence, not Motion’s entire upstream suite.
                </p>
            </header>

            <section className="case-list">
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
                            <code>{item.api.join(" · ")}</code>
                            <details>
                                <summary>
                                    Upstream source and acceptance criteria
                                </summary>
                                <div className="case-detail">
                                    <p>
                                        <b>{item.upstream.sourceVersion}</b> ·{" "}
                                        {item.upstream.path}
                                    </p>
                                    <p>“{item.upstream.testName}”</p>
                                    <ul>
                                        {item.assertions.map((assertion) => (
                                            <li key={assertion}>{assertion}</li>
                                        ))}
                                    </ul>
                                    {item.gap && (
                                        <p className="gap-copy">
                                            Gap: {item.gap}
                                        </p>
                                    )}
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
                            />
                            <div className="case-evidence">
                                <EvidenceMark
                                    available={item.evidence.packageTest}
                                    label="Package"
                                />
                                <EvidenceMark
                                    available={item.evidence.gallery}
                                    label="Gallery"
                                />
                                <EvidenceMark
                                    available={item.evidence.dualRenderer}
                                    label="Web ↔ Lynx"
                                />
                                <EvidenceMark
                                    available={item.evidence.native}
                                    label="Native"
                                />
                            </div>
                        </div>
                    </article>
                ))}
            </section>
        </main>
    )
}

export function EvidencePortal() {
    const view = currentView()
    return (
        <div className={`site-shell view-${view}`}>
            <a className="skip-link" href="#main-content">
                Skip to evidence
            </a>
            <Masthead view={view} />
            {view === "overview" && <Overview />}
            {view === "examples" && <Examples />}
            {view === "api" && <ApiMatrix />}
            {view === "conformance" && <Conformance />}
            <footer className="footer">
                <span>Manifest snapshot · PR checks are authoritative</span>
                <div>
                    <a href="https://github.com/Huxpro/motion/blob/main/lynx/src/conformance/cases.ts">
                        Manifest source
                    </a>
                    <a href="https://github.com/Huxpro/motion/issues/3">
                        Gap backlog
                    </a>
                </div>
            </footer>
        </div>
    )
}
