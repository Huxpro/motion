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
    examples: "Live comparison",
    api: "API matrix",
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
                <span className="wordmark-motion">MOTION</span>
                <span className="wordmark-cross">×</span>
                <span className="wordmark-lynx">LYNX</span>
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
            <div className="build-stamp">
                <span className="stamp-pulse" aria-hidden="true" />
                #3436 preview
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
            <section className="hero">
                <div className="hero-copy">
                    <p className="eyebrow">
                        Declarative adapter · evidence report 01
                    </p>
                    <h1>
                        What works is visible.
                        <br />
                        What differs is named.
                    </h1>
                    <p className="hero-deck">
                        A living review artifact for Motion’s declarative API on
                        ReactLynx— executable examples, atomic support
                        contracts, and upstream-linked tests.
                    </p>
                    <div className="hero-actions">
                        <a className="action-primary" href="?view=examples">
                            Compare both runtimes
                        </a>
                        <a
                            className="action-secondary"
                            href="?view=conformance"
                        >
                            Inspect test coverage →
                        </a>
                    </div>
                </div>
                <aside
                    className="release-note"
                    aria-label="Current release assessment"
                >
                    <span className="release-kicker">Current verdict</span>
                    <strong>
                        Useful subset,
                        <br />
                        not drop-in parity.
                    </strong>
                    <p>
                        Animation primitives are reused upstream. Lynx owns the
                        host, worklet, gesture, layout, and component-tree
                        boundaries.
                    </p>
                    <span className="release-signature">
                        #3405 core → #3436 extension
                    </span>
                </aside>
            </section>

            <section className="scoreline" aria-label="Capability summary">
                <div className="score-main">
                    <span className="score-value">
                        {implementationPercent}%
                    </span>
                    <div>
                        <strong>
                            of tracked atomic APIs are implemented or partial
                        </strong>
                        <span>
                            {API_METRICS.supported} supported ·{" "}
                            {API_METRICS.partial} scoped · {API_METRICS.blocked}{" "}
                            blocked
                        </span>
                    </div>
                </div>
                <CoverageStrip />
                <p className="scope-note">
                    Denominator: {API_METRICS.total} APIs in the curated
                    declarative adapter scope—not the complete Motion package.
                </p>
            </section>

            <section className="evidence-ladder">
                <div className="section-heading">
                    <p className="eyebrow">Evidence ladder</p>
                    <h2>Implementation is ahead of exact conformance.</h2>
                    <p>
                        Each rung is stricter. A Gallery demo cannot silently
                        count as upstream parity.
                    </p>
                </div>
                <div className="ladder" role="list">
                    <div className="ladder-row" role="listitem">
                        <span className="ladder-index">01</span>
                        <strong>{CONFORMANCE_METRICS.tracked}</strong>
                        <span>upstream contracts tracked</span>
                        <i style={{ width: "100%" }} />
                    </div>
                    <div className="ladder-row" role="listitem">
                        <span className="ladder-index">02</span>
                        <strong>{CONFORMANCE_METRICS.gallery}</strong>
                        <span>executable in Gallery</span>
                        <i
                            style={{
                                width: `${
                                    (CONFORMANCE_METRICS.gallery /
                                        CONFORMANCE_METRICS.tracked) *
                                    100
                                }%`,
                            }}
                        />
                    </div>
                    <div
                        className="ladder-row ladder-row-emphasis"
                        role="listitem"
                    >
                        <span className="ladder-index">03</span>
                        <strong>{CONFORMANCE_METRICS.dualRenderer}</strong>
                        <span>exact Web ↔ Lynx semantic case</span>
                        <i style={{ width: `${Math.max(8, exactPercent)}%` }} />
                    </div>
                    <div className="ladder-row" role="listitem">
                        <span className="ladder-index">04</span>
                        <strong>{CONFORMANCE_METRICS.native}</strong>
                        <span>native evidence recorded</span>
                        <i
                            style={{
                                width: `${Math.max(
                                    8,
                                    (CONFORMANCE_METRICS.native /
                                        CONFORMANCE_METRICS.tracked) *
                                        100
                                )}%`,
                            }}
                        />
                    </div>
                </div>
            </section>

            <section className="editorial-columns">
                <div className="now-column">
                    <p className="eyebrow">Runnable now</p>
                    <h2>{GALLERY_EXAMPLES.length} live scenarios</h2>
                    <p>
                        Object targets, reactive updates, local variants,
                        keyframes, repeat/reverse, color mixing, tap/hover
                        priority, callbacks, lifecycle, and custom hosts.
                    </p>
                    <a href="?view=examples">Open the comparison studio →</a>
                </div>
                <div className="boundary-column">
                    <p className="eyebrow">Architecture queue</p>
                    <ol>
                        <li>
                            <span>01</span> variant propagation & orchestration
                        </li>
                        <li>
                            <span>02</span> focus, in-view & drag adapters
                        </li>
                        <li>
                            <span>03</span> layout projection & presence tree
                        </li>
                        <li>
                            <span>04</span> consumer ref / handler composition
                        </li>
                    </ol>
                </div>
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
                    <p className="eyebrow">Live comparison studio</p>
                    <h1>
                        Same Motion props.
                        <br />
                        Two renderers.
                    </h1>
                </div>
                <p>
                    Interact with both panes. The left runs the locked upstream
                    Web baseline; the right runs the #3436 ReactLynx preview
                    through Lynx for Web.
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
                    <h1>
                        Support is a contract,
                        <br />
                        not a checkbox.
                    </h1>
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
                    <h1>Coverage you can audit.</h1>
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
        <div className="site-shell">
            <a className="skip-link" href="#main-content">
                Skip to evidence
            </a>
            <Masthead view={view} />
            {view === "overview" && <Overview />}
            {view === "examples" && <Examples />}
            {view === "api" && <ApiMatrix />}
            {view === "conformance" && <Conformance />}
            <footer className="footer">
                <span>Motion × Lynx / declarative evidence</span>
                <span>
                    Manifest-derived · PR-previewable · no compatibility claim
                    by implication
                </span>
            </footer>
        </div>
    )
}
