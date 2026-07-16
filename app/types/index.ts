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
  email: string;
}

export type BlockType = "TEXT" | "IMAGE";

export type ArticleStatus = "DRAFT" | "PUBLISHED";

// Chuyên mục rút gọn, đúng những gì API nhúng trong bài viết
export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
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
}

export interface ArticleListFilters {
  page?: number;
  limit?: number;
  status?: ArticleStatus;
  categoryId?: string;
  q?: string;
}

export interface EditorBlock {
  key: string;
  type: BlockType;
  content: string;
  file?: File | null;
  preview?: string;
}

/**
 * Bản nháp gửi sang tab xem thử qua localStorage. Phải JSON hóa được nên không
 * mang theo File — ảnh chưa upload đi bằng blob URL của tab đang soạn.
 */
export interface ArticlePreviewDraft {
  title: string;
  description: string;
  thumbnail?: string;
  categoryName?: string;
  blocks: { key: string; type: BlockType; content: string }[];
}

export type BlockPayload =
  | { type: "TEXT"; content: string }
  | { type: "IMAGE"; imageIndex: number; content?: string };

export const STATUS_LABEL: Record<ArticleStatus, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã đăng",
};
