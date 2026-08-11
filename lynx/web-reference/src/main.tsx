import { createRoot } from "react-dom/client"
import { EvidencePortal } from "./portal.js"
import { App as ReferenceGallery } from "./scene.js"

const mode = new URLSearchParams(window.location.search).get("mode")

createRoot(document.getElementById("root")!).render(
    mode === "baseline" ? <ReferenceGallery /> : <EvidencePortal />
)
