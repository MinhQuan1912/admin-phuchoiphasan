/**
 * Bản client của slugify bên backend — chỉ dùng để gợi ý/xem trước.
 * Slug thật luôn do server sinh và kiểm tra trùng.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD") // tách dấu ra khỏi chữ cái
    .replace(/[̀-ͯ]/g, "") // rồi bỏ dấu
    .replace(/[đĐ]/g, "d") // đ/Đ không tách được bằng NFD nên xử lý riêng
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}
