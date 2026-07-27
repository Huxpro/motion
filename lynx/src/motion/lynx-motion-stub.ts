// Stub that replaces `@lynx-js/motion` when the USE_LYNX_MOTION build flag is
// off (via `source.alias` in lynx.config.ts), so the real Motion engine is not
// bundled into the default `mtAnimate` build. The export is never called — the
// `__USE_LYNX_MOTION__` branch that would call it is dead-code-eliminated.
export const animate = (..._args: unknown[]): void => {}
