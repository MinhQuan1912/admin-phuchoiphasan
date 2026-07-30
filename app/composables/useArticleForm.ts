import type {
  ArticleStatus,
  BlockPayload,
  CategoryKind,
  EditorBlock,
  Article,
} from "~/types";

export function useArticleForm() {
  function buildArticleFormData(payload: {
    title?: string;
    categoryId?: string;
    status?: ArticleStatus;
    featured?: boolean;
    thumbnailFile?: File | null;
    blocks?: EditorBlock[] | null;
    court?: string;
    documentCode?: string;
    effectiveDate?: string;
  }): FormData {
    const fd = new FormData();

    if (payload.title !== undefined) fd.append("title", payload.title);
    if (payload.categoryId !== undefined)
      fd.append("categoryId", payload.categoryId);
    if (payload.status !== undefined) fd.append("status", payload.status);
    if (payload.featured !== undefined)
      fd.append("featured", String(payload.featured));
    if (payload.court !== undefined) fd.append("court", payload.court);
    if (payload.documentCode !== undefined)
      fd.append("documentCode", payload.documentCode);
    if (payload.effectiveDate !== undefined)
      fd.append("effectiveDate", payload.effectiveDate);
    if (payload.thumbnailFile) fd.append("thumbnail", payload.thumbnailFile);

    if (payload.blocks) {
      let imageIndex = 0;
      const json: BlockPayload[] = payload.blocks.map((b) => {
        if (b.type === "TEXT") {
          return { type: "TEXT", content: b.content || "" };
        }
        const caption = b.caption?.trim() || undefined;
        if (!b.file && b.content?.startsWith("http")) {
          return { type: "IMAGE", imageIndex: -1, content: b.content, caption };
        }
        fd.append("contentImages", b.file as File);
        return { type: "IMAGE", imageIndex: imageIndex++, caption };
      });
      fd.append("blocks", JSON.stringify(json));
    }

    return fd;
  }

  function validateArticle(
    form: {
      title: string;
      categoryId?: string;
      thumbnailFile?: File | null;
      thumbnailUrl?: string;
      blocks: EditorBlock[];
      kind?: CategoryKind;
      documentCode?: string;
      effectiveDate?: string;
    },
    isEdit = false,
  ): string | null {
    if (!form.title.trim()) return "Vui lòng nhập tiêu đề";
    if (!form.categoryId) return "Vui lòng chọn chuyên mục";
    if (form.kind === "LEGAL") {
      if (!form.documentCode?.trim()) return "Vui lòng nhập số hiệu văn bản";
      if (!form.effectiveDate) return "Vui lòng chọn ngày hiệu lực";
    }
    if (!isEdit && !form.thumbnailFile) return "Vui lòng chọn ảnh đại diện";
    if (isEdit && !form.thumbnailFile && !form.thumbnailUrl)
      return "Thiếu ảnh đại diện";
    if (!form.blocks.length) return "Vui lòng nhập nội dung";

    for (const [i, b] of form.blocks.entries()) {
      if (b.type === "TEXT" && !b.content.trim())
        return `Khối #${i + 1}: nội dung văn bản đang trống`;
      if (b.type === "IMAGE" && !b.file && !b.content?.startsWith("http")) {
        return `Khối #${i + 1}: chưa chọn ảnh`;
      }
    }
    return null;
  }

  function articleToEditorBlocks(article: Article): EditorBlock[] {
    return (article.blocks ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((b) => ({
        key: b.id,
        type: b.type,
        content: b.content,
        caption: b.caption ?? "",
        file: null,
      }));
  }

  return {
    buildArticleFormData,
    validateArticle,
    articleToEditorBlocks,
  };
}
