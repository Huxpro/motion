import { useMemo, useState } from "react"
import {
    API_METRICS,
    ATOMIC_CAPABILITIES,
    CONFORMANCE_CASES,
    CONFORMANCE_METRICS,
    GALLERY_EXAMPLES,
    type SupportStatus,
} from "../../src/conformance/cases.js"
import "./portal.css"

type View = "overview" | "examples" | "api" | "conformance"

const VIEW_LABELS: Record<View, string> = {
    overview: "Overview",
    examples: "Examples",
    api: "API",
    conformance: "Conformance",
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
                aria-label="Motion on Lynx evidence overview"
            >
                <span className="motion-glyph" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                </span>
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
                    >
                        {VIEW_LABELS[item]}
                    </a>
                ))}
            </nav>
            <div className="build-stamp">Evidence / #3436</div>
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

function Overview() {
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
                    <p className="eyebrow">Declarative adapter / PR monitor</p>
                    <h1>Motion / Lynx status</h1>
                    <p>
                        Manifest-derived snapshot for{" "}
                        <a
                            href="https://github.com/lynx-family/lynx-stack/pull/3436"
                            target="_blank"
                            rel="noreferrer"
                        >
                            lynx-stack#3436
                        </a>
                        , stacked on{" "}
                        <a
                            href="https://github.com/lynx-family/lynx-stack/pull/3405"
                            target="_blank"
                            rel="noreferrer"
                        >
                            #3405
                        </a>
                        . CI health remains authoritative in the PR checks.
                    </p>
                </div>
                <div className="monitor-verdict">
                    <span className="monitor-verdict-label">
                        <i aria-hidden="true" /> Current verdict
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
                    <small>
                        {implementationPercent}% implemented or partial
                    </small>
                    <i style={{ width: `${implementationPercent}%` }} />
                </a>
                <a className="monitor-metric" href="?view=conformance">
                    <span>Exact parity</span>
                    <strong>
                        {CONFORMANCE_METRICS.conformant} /{" "}
                        {CONFORMANCE_METRICS.tracked}
                    </strong>
                    <small>{exactPercent}% dual-renderer conformance</small>
                    <i style={{ width: `${Math.max(3, exactPercent)}%` }} />
                </a>
                <a className="monitor-metric" href="?view=conformance">
                    <span>Package evidence</span>
                    <strong>
                        {packageTestCount} / {CONFORMANCE_METRICS.tracked}
                    </strong>
                    <small>
                        {packageTestPercent}% have focused package tests
                    </small>
                    <i style={{ width: `${packageTestPercent}%` }} />
                </a>
                <a className="monitor-metric" href="?view=examples">
                    <span>Gallery runnable</span>
                    <strong>
                        {CONFORMANCE_METRICS.gallery} /{" "}
                        {CONFORMANCE_METRICS.tracked}
                    </strong>
                    <small>{galleryPercent}% executable in both panes</small>
                    <i style={{ width: `${galleryPercent}%` }} />
                </a>
                <a className="monitor-metric" href="?view=conformance">
                    <span>Native evidence</span>
                    <strong>
                        {CONFORMANCE_METRICS.native} /{" "}
                        {CONFORMANCE_METRICS.tracked}
                    </strong>
                    <small>{nativePercent}% recorded on a native client</small>
                    <i style={{ width: `${Math.max(3, nativePercent)}%` }} />
                </a>
            </section>

            <section className="monitor-split">
                <article className="capability-monitor">
                    <header className="monitor-section-header">
                        <div>
                            <p className="eyebrow">Capability progress</p>
                            <h2>Atomic API by area</h2>
                        </div>
                        <a href="?view=api">Open API inventory →</a>
                    </header>
                    <div
                        className="capability-table"
                        role="table"
                        aria-label="Atomic API status by area"
                    >
                        <div
                            className="capability-row capability-row-head"
                            role="row"
                        >
                            <span role="columnheader">Area</span>
                            <span role="columnheader">Supported</span>
                            <span role="columnheader">Partial</span>
                            <span role="columnheader">Blocked</span>
                            <span role="columnheader">Distribution</span>
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
                        <div>
                            <p className="eyebrow">Open blockers</p>
                            <h2>{blockers.length} atomic gaps</h2>
                        </div>
                    </header>
                    <ol className="blocker-list">
                        {blockers.map((item, index) => (
                            <li key={item.id}>
                                <span>
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <div>
                                    <code>{item.api}</code>
                                    <small>{item.group}</small>
                                </div>
                            </li>
                        ))}
                    </ol>
                </aside>
            </section>

            <section className="test-monitor">
                <header className="monitor-section-header test-monitor-header">
                    <div>
                        <p className="eyebrow">Upstream test monitor</p>
                        <h2>{CONFORMANCE_METRICS.tracked} tracked contracts</h2>
                    </div>
                    <div className="test-summary">
                        <span>
                            <i className="summary-supported" />
                            {CONFORMANCE_METRICS.conformant} conformant
                        </span>
                        <span>
                            <i className="summary-partial" />
                            {CONFORMANCE_METRICS.partial} partial
                        </span>
                        <span>
                            <i className="summary-blocked" />
                            {CONFORMANCE_METRICS.blocked} blocked
                        </span>
                    </div>
                </header>
                <div className="test-table-scroll">
                    <div
                        className="test-table"
                        role="table"
                        aria-label="Upstream conformance evidence matrix"
                    >
                        <div className="test-row test-row-head" role="row">
                            <span role="columnheader">
                                Contract / upstream test
                            </span>
                            <span role="columnheader">Package</span>
                            <span role="columnheader">Gallery</span>
                            <span role="columnheader">Dual</span>
                            <span role="columnheader">Native</span>
                            <span role="columnheader">Result</span>
                        </div>
                        {CONFORMANCE_CASES.map((item, index) => (
                            <div className="test-row" role="row" key={item.id}>
                                <div className="test-contract" role="cell">
                                    <span>
                                        {String(index + 1).padStart(2, "0")} /{" "}
                                        {item.category}
                                    </span>
                                    <strong>{item.title}</strong>
                                    <small>{item.upstream.testName}</small>
                                </div>
                                <EvidenceMark
                                    available={item.evidence.packageTest}
                                    label="Package test"
                                />
                                <EvidenceMark
                                    available={item.evidence.gallery}
                                    label="Gallery"
                                />
                                <EvidenceMark
                                    available={item.evidence.dualRenderer}
                                    label="Dual renderer"
                                />
                                <EvidenceMark
                                    available={item.evidence.native}
                                    label="Native evidence"
                                />
                                <StatusMark
                                    status={
                                        item.status === "conformant"
                                            ? "supported"
                                            : item.status
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <footer className="test-monitor-footer">
                    Evidence availability is not a live CI result. Open the{" "}
                    <a href="?view=conformance">conformance ledger</a> for
                    source paths, assertions, and gaps.
                </footer>
            </section>

            <section className="gallery-showoff">
                <div>
                    <p className="eyebrow">Gallery / executable showcase</p>
                    <h2>{GALLERY_EXAMPLES.length} live scenarios</h2>
                </div>
                <p>
                    The Gallery demonstrates the supported subset and makes
                    renderer differences visible. It is evidence, but it does
                    not raise a case to exact conformance by itself.
                </p>
                <a href="?view=examples">Open Web / Lynx Gallery →</a>
            </section>
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
                    <p className="eyebrow">Executable comparison</p>
                    <h1>Compare Web and Lynx.</h1>
                </div>
                <p>
                    Use both panes. Web runs the locked upstream baseline; Lynx
                    runs the #3436 adapter through Lynx for Web.
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
                    <p className="eyebrow">Scenario index</p>
                    <h2>{GALLERY_EXAMPLES.length} executable combinations</h2>
                    <p>
                        These are human-facing compositions. Exact upstream
                        coverage is tracked separately.
                    </p>
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
                    <p className="eyebrow">Atomic API inventory</p>
                    <h1>Supported API surface.</h1>
                </div>
                <div className="matrix-summary">
                    <CoverageStrip />
                    <p>
                        {API_METRICS.total} tracked APIs ·{" "}
                        {API_METRICS.supported} supported ·{" "}
                        {API_METRICS.partial} partial · {API_METRICS.blocked}{" "}
                        blocked
                    </p>
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
    const exact = Math.round(
        (CONFORMANCE_METRICS.conformant / CONFORMANCE_METRICS.tracked) * 100
    )
    return (
        <main className="page conformance-page" id="main-content">
            <header className="page-intro conformance-intro">
                <div>
                    <p className="eyebrow">Curated upstream test slice</p>
                    <h1>Upstream conformance.</h1>
                </div>
                <div className="conformance-number">
                    <strong>{exact}%</strong>
                    <span>exact dual-renderer conformance</span>
                </div>
            </header>

            <section
                className="coverage-ledger"
                aria-label="Conformance coverage metrics"
            >
                <div>
                    <span>Tracked contracts</span>
                    <strong>{CONFORMANCE_METRICS.tracked}</strong>
                    <small>100%</small>
                </div>
                <div>
                    <span>Conformant</span>
                    <strong>{CONFORMANCE_METRICS.conformant}</strong>
                    <small>{exact}%</small>
                </div>
                <div>
                    <span>Runnable / partial</span>
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
                    <span>Blocked</span>
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

            <p className="method-note">
                This denominator is a source-linked declarative slice selected
                for Lynx convergence. It is deliberately not presented as
                coverage of Motion’s entire upstream test suite.
            </p>

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
                            <span>
                                {item.evidence.dualRenderer
                                    ? "Web ↔ Lynx"
                                    : item.evidence.gallery
                                    ? "Gallery evidence"
                                    : "Not executable"}
                            </span>
                            <span>
                                {item.evidence.native
                                    ? "Native recorded"
                                    : "Native pending"}
                            </span>
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
                <span>Motion / Lynx</span>
                <span>
                    Manifest-derived · PR preview · compatibility claims require
                    evidence
                </span>
            </footer>
        </div>
    )
}
