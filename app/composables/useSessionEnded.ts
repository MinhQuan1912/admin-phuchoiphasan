// Thông báo phiên đăng nhập bị kết thúc (hết hạn token, hoặc tài khoản được
// đăng nhập ở nơi khác). Có giá trị = modal đang mở, null = không hiện gì.
// Việc đăng xuất + chuyển về trang đăng nhập chỉ xảy ra khi người dùng bấm
// "Xác nhận" trong modal, xem `SessionEndedModal.vue`.
export function useSessionEnded() {
  return useState<string | null>("admin-session-ended", () => null);
}
