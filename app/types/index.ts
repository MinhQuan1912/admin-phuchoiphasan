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

// Phân loại nội dung: NEWS (tin tức), NOTICE (thông báo phá sản) hoặc EVENT (sự kiện)
export type CategoryKind = "NEWS" | "NOTICE" | "EVENT";

export const KIND_LABEL: Record<CategoryKind, string> = {
  NEWS: "Tin tức",
  NOTICE: "Thông báo",
  EVENT: "Sự kiện",
};

// Chuyên mục rút gọn, đúng những gì API nhúng trong bài viết
export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
  kind: CategoryKind;
}

// Bản đầy đủ, chỉ GET /categories mới trả về
export interface Category extends CategoryRef {
  order: number;
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
  description: string;
  thumbnail: string;
  status: ArticleStatus;
  // Tòa chuyên trách thụ lý — chỉ có ở thông báo phá sản (kind = NOTICE)
  court: Court | null;
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
}

export interface ArticleListFilters {
  page?: number;
  limit?: number;
  status?: ArticleStatus;
  categoryId?: string;
  kind?: CategoryKind;
  court?: Court;
  q?: string;
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
 * Không có thumbnail/description: hai trường đó chỉ dùng cho card ở danh sách
 * và SEO, thân bài không render lại.
 */
export interface ArticlePreviewDraft {
  title: string;
  categoryName?: string;
  blocks: { key: string; type: BlockType; content: string; caption?: string }[];
}

export type BlockPayload =
  | { type: "TEXT"; content: string }
  | { type: "IMAGE"; imageIndex: number; content?: string; caption?: string };

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
