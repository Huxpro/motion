/**
 * Minimal portal i18n: English and Simplified Chinese. The language comes
 * from `?lang=` (persisted to localStorage), so switching is a plain link
 * navigation and every internal href just preserves the parameter.
 *
 * Manifest data (case titles, summaries, upstream test names) stays in
 * English on purpose — it quotes the upstream Motion source of truth.
 */

export type Lang = "en" | "zh"

const STORAGE_KEY = "motion-lynx-lang"

export function currentLang(): Lang {
    const fromUrl = new URLSearchParams(window.location.search).get("lang")
    if (fromUrl === "zh" || fromUrl === "en") {
        try {
            localStorage.setItem(STORAGE_KEY, fromUrl)
        } catch {}
        return fromUrl
    }
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored === "zh" || stored === "en") return stored
    } catch {}
    return "en"
}

/** Internal href that keeps the current language selection. */
export function localizedHref(lang: Lang, params: Record<string, string>) {
    const search = new URLSearchParams(params)
    if (lang !== "en") search.set("lang", lang)
    return `?${search.toString()}`
}

type Entry = { en: string; zh: string }

const STRINGS = {
    "skip": { en: "Skip to evidence", zh: "跳转到正文" },
    "lang.toggle": { en: "中文", zh: "EN" },
    "lang.toggleLabel": { en: "切换到中文", zh: "Switch to English" },

    "nav.overview": { en: "Overview", zh: "总览" },
    "nav.examples": { en: "Examples", zh: "示例对比" },
    "nav.api": { en: "API", zh: "API" },
    "nav.conformance": { en: "Conformance", zh: "一致性" },
    "nav.label": { en: "Evidence views", zh: "证据视图" },
    "masthead.label": {
        en: "Motion on Lynx evidence overview",
        zh: "Motion on Lynx 证据总览",
    },
    "masthead.stack": { en: "Canonical stack", zh: "标准 PR 栈" },

    "overview.title": { en: "Motion / Lynx status", zh: "Motion / Lynx 现状" },
    "overview.stackedMid": { en: "stacked on", zh: "堆叠于" },
    "overview.stackedPost": {
        en: "· conformance PRs follow · #3509 remote restack pending",
        zh: "· 后接一致性 PR · #3509 远端重叠待完成",
    },
    "overview.verdictLabel": { en: "Compatibility", zh: "兼容性结论" },
    "overview.verdict": {
        en: "Useful subset, not drop-in compatible",
        zh: "可用子集，非直接替换级兼容",
    },
    "overview.versions": {
        en: "Upstream source 12.40.0 · Web baseline 13.0.0",
        zh: "上游源码 12.40.0 · Web 基线 13.0.0",
    },
    "overview.metricsLabel": {
        en: "Current progress metrics",
        zh: "当前进度指标",
    },
    "metric.apiReadiness": { en: "API readiness", zh: "API 就绪度" },
    "metric.apiReadinessNote": {
        en: "{0}% implemented or partial",
        zh: "{0}% 已实现或部分实现",
    },
    "metric.exactParity": { en: "Exact parity", zh: "精确一致" },
    "metric.exactParityNote": {
        en: "{0}% dual-renderer conformance",
        zh: "{0}% 双渲染器一致性",
    },
    "metric.packageEvidence": { en: "Package evidence", zh: "包内测试" },
    "metric.packageEvidenceNote": {
        en: "{0}% have focused package tests",
        zh: "{0}% 具备针对性包内测试",
    },
    "metric.galleryRunnable": { en: "Gallery runnable", zh: "画廊可运行" },
    "metric.galleryRunnableNote": {
        en: "{0}% executable in both panes",
        zh: "{0}% 可在双栏中执行",
    },
    "metric.weightedLoss": { en: "Weighted loss", zh: "加权损失" },
    "metric.weightedLossNote": {
        en: "importance-adjusted unresolved semantics",
        zh: "按重要性加权的未解决语义",
    },
    "metric.nativeEvidence": { en: "Native evidence", zh: "原生端证据" },
    "metric.nativeEvidenceNote": {
        en: "{0}% recorded on a native client",
        zh: "{0}% 已在原生客户端录证",
    },

    "validation.title": { en: "Current validation gates", zh: "当前验证关卡" },
    "validation.desc": {
        en: "Current canonical worktree evidence. Published Gallery metrics stay pinned until an immutable preview exists.",
        zh: "当前标准工作树证据。发布版 Gallery 指标在不可变预览产出前保持原 pin。",
    },
    "validation.date": { en: "13 Aug 2026", zh: "2026-08-13" },
    "validation.pass": { en: "Pass", zh: "通过" },
    "validation.blocked": { en: "Blocked", zh: "阻塞" },
    "validation.package": { en: "Package regression", zh: "包内回归" },
    "validation.packageNote": {
        en: "15 test files · TypeScript passes",
        zh: "15 个测试文件 · TypeScript 通过",
    },
    "validation.headless": { en: "Headless interaction", zh: "无头交互" },
    "validation.headlessNote": {
        en: "hover → press → release → leave · lifecycle 5/5 · zero console errors",
        zh: "悬停 → 按压 → 释放 → 离开 · 生命周期 5/5 · 控制台零错误",
    },
    "validation.native": { en: "Android native", zh: "Android 原生端" },
    "validation.nativeNote": {
        en: "Bundle loads; Sandbox host lacks the current MTS / MainThreadObject runtime contract",
        zh: "Bundle 可加载；Sandbox host 缺少当前 MTS / MainThreadObject 运行时契约",
    },

    "areas.title": { en: "API progress by area", zh: "分领域 API 进度" },
    "areas.open": { en: "Open API inventory →", zh: "打开 API 清单 →" },
    "areas.tableLabel": {
        en: "Atomic API status by area",
        zh: "分领域原子 API 状态",
    },
    "areas.area": { en: "Area", zh: "领域" },
    "areas.supported": { en: "Supported", zh: "支持" },
    "areas.partial": { en: "Partial", zh: "部分" },
    "areas.blocked": { en: "Blocked", zh: "阻塞" },
    "areas.distribution": { en: "Distribution", zh: "分布" },

    "gaps.title": { en: "Ranked next gaps", zh: "下一步差距排序" },
    "gaps.blockers": { en: "{0} API blockers", zh: "{0} 个 API 阻塞项" },

    "loss.title": { en: "Weighted conformance loss", zh: "加权一致性损失" },
    "loss.desc": {
        en: "Importance-weighted semantic gap; partial = ½ loss, blocked = full loss.",
        zh: "按重要性加权的语义差距；部分实现计 ½ 损失，阻塞计全额损失。",
    },
    "loss.chartLabel": {
        en: "Weighted loss is {0} after {1} recorded PR steps",
        zh: "经过 {1} 个已记录 PR 步骤后加权损失为 {0}",
    },
    "loss.pending": { en: "pending", zh: "待定" },
    "loss.verified": { en: "verified", zh: "验证后" },
    "loss.history": {
        en: "Full convergence ledger in Conformance →",
        zh: "完整收敛记录见一致性页 →",
    },
    "loss.recentTitle": { en: "Latest steps", zh: "最近收敛步" },
    "loss.pointLabel": {
        en: "Open this step in the convergence ledger",
        zh: "在收敛记录中查看此步骤",
    },

    "showoff.title": {
        en: "Gallery ({0} live scenarios)",
        zh: "画廊（{0} 个实时场景）",
    },
    "showoff.desc": {
        en: "Run the supported subset side by side in Web Motion and ReactLynx, with synced scrolling and shared triggers.",
        zh: "在 Web Motion 与 ReactLynx 中并排运行受支持子集，支持同步滚动与双端同触发。",
    },
    "showoff.cta": { en: "Open Web / Lynx Gallery →", zh: "打开 Web / Lynx 画廊 →" },

    "examples.title": { en: "Compare Web and Lynx.", zh: "对比 Web 与 Lynx。" },
    "examples.desc": {
        en: "The Web pane runs the locked upstream baseline; the Lynx pane runs the #3436 adapter through Lynx for Web. Scrolling and taps can drive both panes at once.",
        zh: "Web 栏运行锁定的上游基线；Lynx 栏通过 Lynx for Web 运行 #3436 适配层。滚动与点按可同时驱动两栏。",
    },
    "examples.sectionLabel": {
        en: "Web and Lynx live examples",
        zh: "Web 与 Lynx 实时示例",
    },
    "examples.webPane": { en: "WEB REFERENCE", zh: "WEB 基线" },
    "examples.lynxPane": { en: "REACTLYNX", zh: "REACTLYNX" },
    "examples.open": { en: "Open ↗", zh: "新窗打开 ↗" },
    "examples.webFrameTitle": { en: "Web Motion reference", zh: "Web Motion 基线" },
    "examples.lynxFrameTitle": {
        en: "ReactLynx Motion preview",
        zh: "ReactLynx Motion 预览",
    },

    "compare.sideBySide": { en: "Side by side", zh: "并排" },
    "compare.overlay": { en: "Overlay", zh: "叠加" },
    "compare.layoutLabel": { en: "Comparison layout", zh: "对比布局" },
    "compare.syncScroll": { en: "Sync scroll", zh: "同步滚动" },
    "compare.mirrorTaps": { en: "Mirror taps", zh: "镜像点按" },
    "compare.replay": { en: "Replay both", zh: "双端重播" },
    "compare.connecting": { en: "connecting…", zh: "连接中…" },
    "compare.linked": { en: "panes linked", zh: "双栏已联动" },
    "compare.unavailable": {
        en: "pane bridge unavailable (cross-origin dev preview)",
        zh: "双栏联动不可用（跨域开发预览）",
    },
    "compare.dragHint": {
        en: "Drag to reveal · Lynx ⇄ Web",
        zh: "拖动对比 · Lynx ⇄ Web",
    },

    "scenarios.title": { en: "{0} executable combinations", zh: "{0} 个可执行组合" },
    "scenarios.desc": {
        en: "Human-facing compositions. Exact upstream coverage is tracked in Conformance.",
        zh: "面向人工审阅的组合场景。精确上游覆盖见一致性页。",
    },
    "scenarios.run": { en: "Run both ▶", zh: "双端运行 ▶" },
    "scenarios.runLabel": {
        en: "Scroll both panes to {0} and trigger it",
        zh: "滚动双栏到 {0} 并触发",
    },

    "api.title": { en: "Supported API surface.", zh: "受支持的 API 面。" },
    "api.summary": {
        en: "{0} tracked APIs · {1} supported · {2} partial · {3} blocked",
        zh: "跟踪 {0} 个 API · {1} 支持 · {2} 部分 · {3} 阻塞",
    },
    "api.filterLabel": { en: "Filter API status", zh: "按状态筛选 API" },
    "api.all": { en: "All {0}", zh: "全部 {0}" },
    "api.docs": { en: "Docs ↗", zh: "文档 ↗" },
    "api.docsLabel": { en: "Motion.dev docs for {0}", zh: "{0} 的 Motion.dev 文档" },

    "conformance.title": { en: "Upstream conformance.", zh: "上游一致性。" },
    "conformance.exact": {
        en: "exact dual-renderer conformance",
        zh: "精确双渲染器一致",
    },
    "conformance.coverageLabel": {
        en: "Conformance coverage metrics",
        zh: "一致性覆盖指标",
    },
    "conformance.tracked": { en: "Tracked contracts", zh: "跟踪契约" },
    "conformance.conformant": { en: "Conformant", zh: "一致" },
    "conformance.partialRunnable": { en: "Runnable / partial", zh: "可运行 / 部分" },
    "conformance.blocked": { en: "Blocked", zh: "阻塞" },
    "conformance.method": {
        en: "This denominator is a source-linked declarative slice selected for Lynx convergence. It is deliberately not presented as coverage of Motion's entire upstream test suite.",
        zh: "该分母是为 Lynx 收敛选取的、与源码关联的声明式子集，特意不宣称覆盖 Motion 上游全部测试套件。",
    },
    "conformance.historyTitle": { en: "Convergence history", zh: "收敛历史" },
    "conformance.historyDesc": {
        en: "Each step links the PR or issue that moved the weighted loss. The chart lives on the Overview.",
        zh: "每一步链接到推动加权损失变化的 PR 或 issue；曲线图见总览页。",
    },
    "conformance.caseListLabel": {
        en: "Tracked upstream contracts",
        zh: "跟踪的上游契约",
    },
    "conformance.upstreamDetail": {
        en: "Upstream source and acceptance criteria",
        zh: "上游源码与验收标准",
    },
    "conformance.viewSource": { en: "View upstream test ↗", zh: "查看上游测试 ↗" },
    "conformance.gap": { en: "Gap:", zh: "差距：" },
    "evidence.package": { en: "Package", zh: "包内测试" },
    "evidence.gallery": { en: "Gallery", zh: "画廊" },
    "evidence.dual": { en: "Dual", zh: "双渲染" },
    "evidence.native": { en: "Native", zh: "原生" },
    "evidence.legend": {
        en: "{0} conformant · {1} partial · {2} blocked",
        zh: "{0} 一致 · {1} 部分 · {2} 阻塞",
    },

    "status.supported": { en: "Supported", zh: "支持" },
    "status.partial": { en: "Partial", zh: "部分" },
    "status.blocked": { en: "Blocked", zh: "阻塞" },
    "record.merged": { en: "merged", zh: "已合并" },
    "record.verified": { en: "verified", zh: "已验证" },
    "record.stacked": { en: "stacked", zh: "堆叠中" },
    "record.pending": { en: "pending", zh: "待定" },
    "mark.yes": { en: "Yes", zh: "有" },

    "footer.snapshot": {
        en: "Repository snapshot, not live CI",
        zh: "仓库快照，非实时 CI",
    },
    "footer.manifest": { en: "Manifest source", zh: "清单源码" },
    "footer.checks": { en: "Live PR checks", zh: "实时 PR 检查" },
    "footer.motionDocs": { en: "Motion.dev docs", zh: "Motion.dev 文档" },
    "footer.upstream": {
        en: "Upstream motion@12.40.0",
        zh: "上游 motion@12.40.0",
    },
} satisfies Record<string, Entry>

export type StringKey = keyof typeof STRINGS

export function makeT(lang: Lang) {
    return (key: StringKey, ...args: (string | number)[]) => {
        let text: string = STRINGS[key][lang]
        args.forEach((arg, index) => {
            text = text.replace(`{${index}}`, String(arg))
        })
        return text
    }
}

export type Translate = ReturnType<typeof makeT>
