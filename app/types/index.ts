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

export type BlockType = "TEXT" | "IMAGE" | "FILE";

export type ArticleStatus = "DRAFT" | "PUBLISHED";

export type CategoryKind = "NEWS" | "NOTICE" | "EVENT" | "FAQ" | "LEGAL";

export const KIND_LABEL: Record<CategoryKind, string> = {
  NEWS: "Tin tức",
  NOTICE: "Thông báo",
  EVENT: "Sự kiện",
  FAQ: "Câu hỏi",
  LEGAL: "Văn bản",
};

export const SINGLE_CATEGORY_KINDS: CategoryKind[] = ["EVENT", "FAQ", "LEGAL"];

export function hasCategoryPicker(kind: CategoryKind) {
  return !SINGLE_CATEGORY_KINDS.includes(kind);
}

export const NOTICE_TYPE_SLUGS = [
  "mo-thu-tuc-pha-san",
  "thong-bao-tong-dat",
  "danh-sach-chu-no-nguoi-mac-no",
  "tuyen-bo-doanh-nghiep-pha-san",
  "lua-chon-to-chuc-dau-gia-tai-san",
];

export function sortNoticeTypes<T extends { slug: string }>(items: T[]): T[] {
  const rank = (slug: string) => {
    const i = NOTICE_TYPE_SLUGS.indexOf(slug);
    return i === -1 ? NOTICE_TYPE_SLUGS.length : i;
  };
  return [...items].sort((a, b) => rank(a.slug) - rank(b.slug));
}

export interface CategoryRef {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  kind: CategoryKind;
}
export interface Category extends CategoryRef {
  articleCount: number;
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  contentEn?: string | null;
  caption: string | null;
  captionEn?: string | null;
  order: number;
  articleId: string;
}

export interface Article {
  id: string;
  title: string;
  titleEn?: string | null;
  slug: string;
  thumbnail: string;
  status: ArticleStatus;
  featured: boolean;
  views: number;
  court: Court | null;
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

export interface ArticleFormPayload {
  title: string;
  titleEn: string;
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
  contentEn?: string;
  caption?: string;
  captionEn?: string;
  file?: File | null;
  preview?: string;
}

export interface ArticlePreviewDraft {
  title: string;
  categoryName?: string;
  blocks: { key: string; type: BlockType; content: string; caption?: string }[];
}

export type BlockPayload =
  | { type: "TEXT"; content: string; contentEn?: string }
  | {
      type: "IMAGE";
      imageIndex: number;
      content?: string;
      caption?: string;
      captionEn?: string;
    }
  | { type: "FILE"; fileIndex: number; content?: string };

export const FILE_ACCEPT = "application/pdf";
export const MAX_FILE_BYTES = 20 * 1024 * 1024;

export const MAX_FEATURED = 3;

export const STATUS_LABEL: Record<ArticleStatus, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã đăng",
};

export type Court = "KV2_HA_NOI" | "KV1_DA_NANG" | "KV1_HCM";

export const COURT_LABEL: Record<Court, string> = {
  KV2_HA_NOI: "TAND khu vực 2 - Hà Nội",
  KV1_DA_NANG: "TAND khu vực 1 - Đà Nẵng",
  KV1_HCM: "TAND khu vực 1 - TP. Hồ Chí Minh",
};
