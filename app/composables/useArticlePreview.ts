import type { ArticlePreviewDraft, EditorBlock } from "~/types";

export const PREVIEW_DRAFT_KEY = "phts_article_preview";
const PREVIEW_ROUTE = "/xem-thu";

export function useArticlePreview() {
  function openPreview(draft: {
    title: string;
    categoryName?: string;
    blocks: EditorBlock[];
  }) {
    const payload: ArticlePreviewDraft = {
      title: draft.title,
      categoryName: draft.categoryName,
      blocks: draft.blocks.map((b) => ({
        key: b.key,
        type: b.type,
        content: b.type === "IMAGE" ? b.preview || b.content : b.content,
        caption: b.type === "IMAGE" ? b.caption?.trim() || undefined : undefined,
      })),
    };

    localStorage.setItem(PREVIEW_DRAFT_KEY, JSON.stringify(payload));
    window.open(PREVIEW_ROUTE, "_blank");
  }

  return { openPreview };
}
