export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore();
  auth.loadToken();
  if (auth.isAuthenticated) return navigateTo("/");
});
