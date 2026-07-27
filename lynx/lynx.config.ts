import { fileURLToPath } from 'node:url'

import { defineConfig } from '@lynx-js/rspeedy'

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin'
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'
import { pluginTypeCheck } from '@rsbuild/plugin-type-check'

// Animation backend switch (compile-time, so the unused path — and its worklet
// capture — is dead-code-eliminated):
//   USE_LYNX_MOTION=1  → drive @lynx-js/motion's real `animate()` (native-ready;
//                        blocked on Lynx-for-Web by a web-core worklet-runtime
//                        bug — see docs/web-mts-crossmodule-bug.md)
//   unset / 0 (default) → inline same-file `mtAnimate` (works on web AND native)
const USE_LYNX_MOTION = process.env.USE_LYNX_MOTION === "1"

export default defineConfig({
  plugins: [
    pluginQRCode({
      schema(url) {
        // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
        return `${url}?fullscreen=true`
      },
    }),
    pluginReactLynx(),
    pluginTypeCheck(),
  ],
  source: {
    define: {
      __USE_LYNX_MOTION__: JSON.stringify(USE_LYNX_MOTION),
    },
    // When the flag is off, alias `@lynx-js/motion` to a tiny stub so the real
    // Motion engine is never bundled into the default (small) mtAnimate build.
    // `$` = exact-match, so subpaths are unaffected.
    alias: USE_LYNX_MOTION
      ? {}
      : {
          '@lynx-js/motion$': fileURLToPath(
            new URL('./src/motion/lynx-motion-stub.ts', import.meta.url)
          ),
        },
  },
  environments: {
    web: {},
    lynx: {},
  },
})
