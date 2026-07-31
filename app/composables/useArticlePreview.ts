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
        content: b.type === "TEXT" ? b.content : b.preview || b.content,
        caption:
          b.type === "TEXT"
            ? undefined
            : b.caption?.trim() || (b.type === "FILE" ? b.file?.name : "") || undefined,
      })),
    };

    localStorage.setItem(PREVIEW_DRAFT_KEY, JSON.stringify(payload));
    window.open(PREVIEW_ROUTE, "_blank");
  }

  return { openPreview };
}
