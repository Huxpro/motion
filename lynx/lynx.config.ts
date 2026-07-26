import { defineConfig } from '@lynx-js/rspeedy'

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin'
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'
import { pluginTypeCheck } from '@rsbuild/plugin-type-check'

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
  environments: {
    web: {},
    lynx: {},
  },
  source: {
    // @lynx-js/motion carries `'main thread'` directives, but the ReactLynx
    // main-thread transform skips node_modules by default — so Motion's
    // main-thread code (including its globals shim) never lands in the
    // main-thread layer, leaving `animate` undefined there. Force it through
    // the transform so it is compiled for the main thread.
    include: [/[\\/]node_modules[\\/]@lynx-js[\\/]motion[\\/]/],
    define: {
      // Belt-and-braces: motion-dom probes the browser-only
      // `window.MotionHandoffAnimation` (SSR optimized-appear handoff); the Lynx
      // main thread has no such global, so compile the probe out.
      'window.MotionHandoffAnimation': 'undefined',
    },
  },
})
