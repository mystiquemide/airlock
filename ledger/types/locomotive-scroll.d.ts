declare module "locomotive-scroll" {
  interface LocomotiveScrollOptions {
    el?: Element | null;
    smooth?: boolean;
    multiplier?: number;
    class?: string;
    [key: string]: unknown;
  }

  interface ScrollInstance {
    scroll: { y: number };
  }

  class LocomotiveScroll {
    scroll: { instance: ScrollInstance };
    constructor(options?: LocomotiveScrollOptions);
    on(event: string, callback: (...args: unknown[]) => void): void;
    scrollTo(target: number | string | Element, options?: Record<string, unknown>): void;
    update(): void;
    destroy(): void;
  }

  export default LocomotiveScroll;
}
