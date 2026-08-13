/// <reference types="@lynx-js/rspeedy/client" />

declare module '@lynx-js/types' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface GlobalProps {
    conformanceMode?:
      | "tap-lifecycle"
      | "tap-rest-transition"
      | "tap-transition-end-only"
      | "animate-transition-end-only"
      | "variant-transition-end-race"
      | "removed-animate-values"
      | "transform-origin"
      | "complex-gradient"
      | "display-exit"
      | "variant-style-fallback"
      | "variant-partial-style-fallback"
      | "variant-propagation"
      | "delay-children"
      | "variant-inherit-opt-out"
      | "initial-false-propagation"
      | "inherited-variant-lifecycle"
      | "inherited-variant-value-update"
      | "deep-variant-propagation"
      | "deep-initial-false-propagation"
      | "deep-delay-children"
      | "explicit-child-delay-root"
      | "nested-controlled-variants"
      | "initial-false-explicit-child"
      | "array-variant-definition-parity"
      | "initial-transition-end"
      | "property-specific-transition"
      | "hover-rest-transition"
  }
}

// This export makes the file a module
export {}
