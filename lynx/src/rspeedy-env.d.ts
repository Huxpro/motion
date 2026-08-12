/// <reference types="@lynx-js/rspeedy/client" />

declare module '@lynx-js/types' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface GlobalProps {
    conformanceMode?:
      | "tap-lifecycle"
      | "tap-rest-transition"
      | "tap-transition-end-only"
      | "animate-transition-end-only"
      | "removed-animate-values"
      | "transform-origin"
      | "complex-gradient"
      | "variant-propagation"
      | "hover-rest-transition"
  }
}

// This export makes the file a module
export {}
