import { defineStore } from "pinia";
import type { Admin, ApiResponse } from "~/types";

const TOKEN_KEY = "phts_admin_token";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(null);
  const admin = ref<Admin | null>(null);
  const isAuthenticated = computed(() => !!token.value);

  function loadToken() {
    if (import.meta.client) token.value = localStorage.getItem(TOKEN_KEY);
    return token.value;
  }

  function setToken(value: string | null) {
    token.value = value;
    if (!import.meta.client) return;
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
  }

  async function login(email: string, password: string) {
    const api = useApi();
    const res = await api<ApiResponse<{ accessToken: string }>>(
      "/auth/admin/login",
      {
        method: "POST",
        body: { email, password },
      },
    );
    setToken(res.data!.accessToken);
    await fetchMe();
    return res.message;
  }

  async function fetchMe() {
    const api = useApi();
    try {
      const res = await api<ApiResponse<Admin>>("/auth/admin/me");
      admin.value = res.data ?? null;
    } catch {
      logout();
    }
    return admin.value;
  }

  function logout() {
    setToken(null);
    admin.value = null;
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    const api = useApi();
    const res = await api<ApiResponse>("/auth/admin/change-password", {
      method: "POST",
      body: { oldPassword, newPassword },
    });
    return res.message;
  }

  async function forgotPassword(email: string) {
    const api = useApi();
    const res = await api<ApiResponse>("/auth/admin/forgot-password", {
      method: "POST",
      body: { email },
    });
    return res.message;
  }

  async function resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ) {
    const api = useApi();
    const res = await api<ApiResponse>("/auth/admin/reset-password", {
      method: "POST",
      body: { email, otp, newPassword },
    });
    return res.message;
  }

  return {
    token,
    admin,
    isAuthenticated,
    loadToken,
    setToken,
    login,
    fetchMe,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
  };
});
