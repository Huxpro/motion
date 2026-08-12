import { createRoot } from "react-dom/client"
import { EvidencePortal } from "./portal.js"
import { App as ReferenceGallery } from "./scene.js"

const mode = new URLSearchParams(window.location.search).get("mode")
const query = new URLSearchParams(window.location.search)
const compareChannel = "motion-lynx-compare"

if (query.get("embed") === "1") {
    let applyingSync = false
    document.documentElement.style.scrollBehavior = "auto"

    const scrollProgress = () => {
        const root = document.scrollingElement ?? document.documentElement
        const range = Math.max(0, root.scrollHeight - window.innerHeight)
        return range === 0 ? 0 : root.scrollTop / range
    }

    window.addEventListener(
        "scroll",
        () => {
            if (applyingSync) return
            window.parent.postMessage(
                {
                    channel: compareChannel,
                    type: "scroll",
                    progress: scrollProgress(),
                },
                "*"
            )
        },
        { passive: true }
    )

    window.addEventListener("message", (event) => {
        const message = event.data
        if (
            event.source !== window.parent ||
            !message ||
            message.channel !== compareChannel ||
            message.type !== "sync" ||
            typeof message.progress !== "number"
        ) {
            return
        }

        const root = document.scrollingElement ?? document.documentElement
        const range = Math.max(0, root.scrollHeight - window.innerHeight)
        applyingSync = true
        window.scrollTo(0, range * Math.min(1, Math.max(0, message.progress)))
        requestAnimationFrame(() => {
            applyingSync = false
        })
    })

    const postHeight = () => {
        window.parent.postMessage(
            {
                channel: compareChannel,
                type: "measure",
                height: Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight
                ),
            },
            "*"
        )
    }
    new ResizeObserver(postHeight).observe(document.body)
    requestAnimationFrame(() => requestAnimationFrame(postHeight))
}

createRoot(document.getElementById("root")!).render(
    mode === "baseline" ? <ReferenceGallery /> : <EvidencePortal />
)
