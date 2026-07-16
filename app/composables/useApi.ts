import type { FetchOptions } from "ofetch";


const GUEST_PATHS = ["/dang-nhap"];

export function useApi() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  const router = useRouter();

  return async <T>(
    url: string,
    opts: FetchOptions<"json"> = {},
  ): Promise<T> => {
    const token = auth.token ?? auth.loadToken();
    const headers: Record<string, string> = { ...(opts.headers as any) };
    if (token) headers.Authorization = `Bearer ${token}`;

    if (opts.body instanceof FormData) delete headers["Content-Type"];

    try {
      return await $fetch<T>(url, {
        baseURL: config.public.apiBase,
        ...opts,
        headers,
      } as any);
    } catch (e: any) {
      const status = e?.response?.status;
      const message: string =
        e?.data?.message || e?.message || "Lỗi kết nối máy chủ";

      if (status === 401) {
        const path = router.currentRoute.value.path;
        if (!GUEST_PATHS.includes(path)) {
          auth.logout();
          if (import.meta.client) await navigateTo("/dang-nhap");
        }
      }
      throw new Error(message);
    }
  };
}
