export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Admin {
  id: string;
  username: string;
}

export type BlockType = "TEXT" | "IMAGE";

export type ArticleStatus = "DRAFT" | "PUBLISHED";

export type CategoryKind = "NEWS" | "NOTICE" | "EVENT" | "FAQ" | "LEGAL";

export const KIND_LABEL: Record<CategoryKind, string> = {
  NEWS: "Tin tức",
  NOTICE: "Thông báo",
  EVENT: "Sự kiện",
  FAQ: "Câu hỏi",
  LEGAL: "Văn bản",
};

/**
 * Các loại chỉ có duy nhất 1 chuyên mục cố định (seed sẵn ở backend). Giao diện
 * ẩn ô chọn chuyên mục và cột Chuyên mục cho những loại này — chuyên mục được
 * gán tự động.
 */
export const SINGLE_CATEGORY_KINDS: CategoryKind[] = ["EVENT", "FAQ", "LEGAL"];

export function hasCategoryPicker(kind: CategoryKind) {
  return !SINGLE_CATEGORY_KINDS.includes(kind);
}

/**
 * 5 loại Thông báo cố định (seed sẵn ở backend) theo thứ tự nghiệp vụ. Backend
 * không giữ thứ tự cho loại thông báo nên danh sách này quyết định thứ tự hiện
 * trong ô chọn chuyên mục khi soạn thông báo — trùng thứ tự menu của website.
 */
export const NOTICE_TYPE_SLUGS = [
  "mo-thu-tuc-pha-san",
  "thong-bao-tong-dat",
  "danh-sach-chu-no-nguoi-mac-no",
  "tuyen-bo-doanh-nghiep-pha-san",
  "lua-chon-to-chuc-dau-gia-tai-san",
];

/** Sắp chuyên mục Thông báo theo thứ tự trên; chuyên mục lạ xếp xuống cuối. */
export function sortNoticeTypes<T extends { slug: string }>(items: T[]): T[] {
  const rank = (slug: string) => {
    const i = NOTICE_TYPE_SLUGS.indexOf(slug);
    return i === -1 ? NOTICE_TYPE_SLUGS.length : i;
  };
  return [...items].sort((a, b) => rank(a.slug) - rank(b.slug));
}

// Chuyên mục rút gọn, đúng những gì API nhúng trong bài viết
export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
  kind: CategoryKind;
}

// Bản đầy đủ, chỉ GET /categories mới trả về
export interface Category extends CategoryRef {
  articleCount: number;
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  // Chú thích ảnh, luôn null với block TEXT
  caption: string | null;
  order: number;
  articleId: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  status: ArticleStatus;
  // Bài nổi bật — website ưu tiên hiển thị ở khối tin nổi bật
  featured: boolean;
  // Lượt xem, backend tăng mỗi lần trang chi tiết công khai được mở
  views: number;
  // Tòa chuyên trách thụ lý — chỉ có ở thông báo phá sản (kind = NOTICE)
  court: Court | null;
  // Số hiệu và ngày hiệu lực — chỉ có ở văn bản pháp luật (kind = LEGAL);
  // effectiveDate là chuỗi ISO do API trả về
  documentCode: string | null;
  effectiveDate: string | null;
  categoryId: string;
  category: CategoryRef;
  blocks?: ContentBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  categories: number;
  notices: number;
  /** Tổng lượt xem của mọi bài viết, không lọc theo kind */
  views: number;
}

export interface ArticleListFilters {
  page?: number;
  limit?: number;
  status?: ArticleStatus;
  categoryId?: string;
  kind?: CategoryKind;
  court?: Court;
  featured?: boolean;
  q?: string;
}

/**
 * Payload ArticleForm emit khi submit. Dùng chung cho mọi loại nội dung —
 * những field chỉ áp dụng cho một loại (court, documentCode, effectiveDate)
 * gửi chuỗi rỗng khi không dùng để backend lưu null.
 */
export interface ArticleFormPayload {
  title: string;
  categoryId: string;
  status: ArticleStatus;
  featured: boolean;
  thumbnailFile: File | null;
  blocks: EditorBlock[];
  court: string;
  documentCode: string;
  effectiveDate: string;
}

export interface EditorBlock {
  key: string;
  type: BlockType;
  content: string;
  caption?: string;
  file?: File | null;
  preview?: string;
}

/**
 * Bản nháp gửi sang tab xem thử qua localStorage. Phải JSON hóa được nên không
 * mang theo File — ảnh chưa upload đi bằng blob URL của tab đang soạn.
 *
 * Không có thumbnail: trường đó chỉ dùng cho card ở danh sách, thân bài không
 * render lại.
 */
export interface ArticlePreviewDraft {
  title: string;
  categoryName?: string;
  blocks: { key: string; type: BlockType; content: string; caption?: string }[];
}

export type BlockPayload =
  | { type: "TEXT"; content: string }
  | { type: "IMAGE"; imageIndex: number; content?: string; caption?: string };

/**
 * Số bài nổi bật tối đa được đăng cùng lúc — phải khớp MAX_FEATURED trong
 * backend/src/article/article.service.ts. Vượt trần thì backend tự bỏ nổi bật
 * bài đăng cũ nhất và báo lại trong message.
 */
export const MAX_FEATURED = 3;

export const STATUS_LABEL: Record<ArticleStatus, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã đăng",
};

// Tòa chuyên trách — đồng bộ với enum Court trong backend/prisma/schema.prisma
export type Court = "KV2_HA_NOI" | "KV1_DA_NANG" | "KV1_HCM";

export const COURT_LABEL: Record<Court, string> = {
  KV2_HA_NOI: "TAND khu vực 2 - Hà Nội",
  KV1_DA_NANG: "TAND khu vực 1 - Đà Nẵng",
  KV1_HCM: "TAND khu vực 1 - TP. Hồ Chí Minh",
};
