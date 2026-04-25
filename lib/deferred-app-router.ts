/**
 * Next.js 15+ can throw "Router action dispatched before initialization" when
 * `router.push` / `router.replace` run from async work that resolves in the
 * same turn as hydration (e.g. cached `getSession()`). Defer to the next task.
 *
 * @see https://github.com/vercel/next.js/issues (E668)
 */

type NavigateRouter = {
  push: (href: string) => void;
  replace: (href: string) => void;
};

function defer(fn: () => void) {
  if (typeof window === "undefined") {
    fn();
    return;
  }
  // Nested macrotask: avoids Next.js App Router "action dispatched before
  // initialization" when async/session work resolves in the hydration window.
  window.setTimeout(() => window.setTimeout(fn, 0), 0);
}

export function deferredRouterReplace(router: NavigateRouter, href: string) {
  defer(() => router.replace(href));
}

export function deferredRouterPush(router: NavigateRouter, href: string) {
  defer(() => router.push(href));
}

type RefreshRouter = { refresh: () => void };

export function deferredRouterRefresh(router: RefreshRouter) {
  defer(() => router.refresh());
}

type BackRouter = { back: () => void };

export function deferredRouterBack(router: BackRouter) {
  defer(() => router.back());
}
