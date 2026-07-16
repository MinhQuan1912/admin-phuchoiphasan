export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  auth.loadToken();

  if (!auth.isAuthenticated) {
    return navigateTo(`/dang-nhap?redirect=${encodeURIComponent(to.fullPath)}`);
  }
  if (!auth.admin) {
    await auth.fetchMe();
    if (!auth.isAuthenticated) return navigateTo("/dang-nhap");
  }
});
