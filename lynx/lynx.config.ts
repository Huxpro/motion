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
  // Playwright asserts zero console errors on gallery pages; the HMR
  // websocket client can flap in sandboxed CI containers and litter the
  // console with reconnect errors, so test runs disable it entirely.
  dev: process.env.RSPEEDY_DISABLE_HMR
    ? { hmr: false, liveReload: false }
    : {},
})
