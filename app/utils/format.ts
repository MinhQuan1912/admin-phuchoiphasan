export function formatNumber(n?: number | null): string {
  return (n ?? 0).toLocaleString("vi-VN");
}
