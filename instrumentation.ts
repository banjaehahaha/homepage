/**
 * 서버(SSR) 환경에서 localStorage가 없거나 깨진 경우(예: Node --localstorage-file)를 대비한 폴리필.
 * 브라우저가 아닌 환경에서만 적용됩니다.
 */
export async function register() {
  if (typeof window === "undefined") {
    const g = globalThis as typeof globalThis & { localStorage?: Storage };
    if (!g.localStorage || typeof g.localStorage.getItem !== "function") {
      g.localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        get length() {
          return 0;
        },
        key: () => null,
      };
    }
  }
}
