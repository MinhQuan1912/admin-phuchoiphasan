export function useLogoutReason() {
  return useState<string | null>("admin-logout-reason", () => null);
}
