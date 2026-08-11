const fs = require("node:fs")
const path = require("node:path")

const root = path.resolve(__dirname, "..")
const webReference = path.join(root, "web-reference", "dist")
const lynxClient = path.join(
    root,
    "node_modules",
    "@lynx-js",
    "web-core",
    "dist",
    "client_prod",
    "static",
)

const required = [
    webReference,
    path.join(root, "dist", "main.web.bundle"),
    lynxClient,
    path.join(root, "web-host", "index.html"),
]

for (const entry of required) {
    if (!fs.existsSync(entry)) {
        throw new Error(`Missing evidence build input: ${entry}`)
    }
}

function assemble(output, preserveExistingEvidence) {
    if (preserveExistingEvidence && fs.existsSync(output)) {
        for (const entry of fs.readdirSync(output)) {
            if (entry !== "evidence") {
                fs.rmSync(path.join(output, entry), { recursive: true, force: true })
            }
        }
    } else {
        fs.rmSync(output, { recursive: true, force: true })
    }

    fs.cpSync(webReference, output, { recursive: true })
    const lynxOutput = path.join(output, "lynx")
    fs.mkdirSync(lynxOutput, { recursive: true })
    fs.cpSync(lynxClient, path.join(lynxOutput, "static"), { recursive: true })
    fs.copyFileSync(
        path.join(root, "dist", "main.web.bundle"),
        path.join(lynxOutput, "main.web.bundle"),
    )
    fs.copyFileSync(
        path.join(root, "web-host", "index.html"),
        path.join(lynxOutput, "index.html"),
    )

    if (preserveExistingEvidence) {
        const sourceEvidence = path.join(root, "evidence")
        const outputEvidence = path.join(output, "evidence")
        fs.mkdirSync(outputEvidence, { recursive: true })
        for (const entry of fs.readdirSync(sourceEvidence)) {
            if (entry.startsWith("portal-")) {
                fs.copyFileSync(
                    path.join(sourceEvidence, entry),
                    path.join(outputEvidence, entry),
                )
            }
        }
    }

    console.log(`Evidence site assembled at ${output}`)
}

assemble(path.join(root, "evidence-dist"), false)
assemble(path.resolve(root, "..", "dev", "html", "motion-lynx-demo"), true)
