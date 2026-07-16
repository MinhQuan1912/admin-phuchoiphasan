import type { ArticlePreviewDraft, EditorBlock } from "~/types";

export const PREVIEW_DRAFT_KEY = "phts_article_preview";
const PREVIEW_ROUTE = "/bai-viet/xem-thu";

export function useArticlePreview() {
  function openPreview(draft: {
    title: string;
    description: string;
    thumbnail?: string;
    categoryName?: string;
    blocks: EditorBlock[];
  }) {
    const payload: ArticlePreviewDraft = {
      title: draft.title,
      description: draft.description,
      thumbnail: draft.thumbnail,
      categoryName: draft.categoryName,
      blocks: draft.blocks.map((b) => ({
        key: b.key,
        type: b.type,
        content: b.type === "IMAGE" ? b.preview || b.content : b.content,
      })),
    };

    localStorage.setItem(PREVIEW_DRAFT_KEY, JSON.stringify(payload));
    window.open(PREVIEW_ROUTE, "_blank");
  }

  return { openPreview };
}
