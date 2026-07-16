import { defineStore } from "pinia";
import type {
  ApiResponse,
  Article,
  ArticleListFilters,
  ArticleStats,
  ArticleStatus,
  Paginated,
} from "~/types";

export const useArticleStore = defineStore("article", () => {
  const items = ref<Article[]>([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(10);
  const totalPages = ref(1);
  const loading = ref(false);
  const current = ref<Article | null>(null);
  const stats = ref<ArticleStats | null>(null);

  // Bộ lọc hiện hành, dùng lại khi tải lại danh sách sau khi xóa/đổi trạng thái
  const filters = reactive<{
    status?: ArticleStatus;
    categoryId?: string;
    q: string;
  }>({ status: undefined, categoryId: undefined, q: "" });

  // Đổi bộ lọc nhanh tay → nhiều request chồng nhau. Chỉ request mới nhất được
  // ghi kết quả, nếu không phản hồi cũ về sau sẽ đè lên và hiện dữ liệu sai bộ lọc.
  let latestListReq = 0;

  async function fetchList(opts: ArticleListFilters = {}) {
    const api = useApi();
    const reqId = ++latestListReq;
    loading.value = true;
    try {
      const query: Record<string, string | number> = {
        page: opts.page ?? page.value,
        limit: opts.limit ?? limit.value,
      };
      // Dùng `in` chứ không dùng `??`: truyền status: undefined phải bỏ được
      // bộ lọc đang lưu (vd trang Tổng quan cần lấy bài mới nhất, không lọc)
      const status = "status" in opts ? opts.status : filters.status;
      const categoryId =
        "categoryId" in opts ? opts.categoryId : filters.categoryId;
      const q = ("q" in opts ? opts.q ?? "" : filters.q).trim();
      if (status) query.status = status;
      if (categoryId) query.categoryId = categoryId;
      if (q) query.q = q;

      const res = await api<ApiResponse<Paginated<Article>>>(
        "/articles/admin/list",
        { query },
      );
      if (reqId !== latestListReq) return;

      const d = res.data!;
      items.value = d.items;
      total.value = d.total;
      page.value = d.page;
      limit.value = d.limit;
      totalPages.value = d.totalPages;
    } catch (e) {
      // Request cũ hỏng thì kệ, đã có request mới thay thế
      if (reqId === latestListReq) throw e;
    } finally {
      // Chỉ request mới nhất được tắt loading, tránh nhấp nháy khi chồng request
      if (reqId === latestListReq) loading.value = false;
    }
  }

  async function fetchStats() {
    const api = useApi();
    const res = await api<ApiResponse<ArticleStats>>("/articles/admin/stats");
    stats.value = res.data ?? null;
    return stats.value;
  }

  async function fetchOne(id: string) {
    const api = useApi();
    loading.value = true;
    try {
      // endpoint admin: lấy được cả bài nháp
      const res = await api<ApiResponse<Article>>(`/articles/admin/${id}`);
      current.value = res.data ?? null;
      return current.value;
    } finally {
      loading.value = false;
    }
  }

  async function create(form: FormData) {
    const api = useApi();
    return await api<ApiResponse<Article>>("/articles", {
      method: "POST",
      body: form,
    });
  }

  async function update(id: string, form: FormData) {
    const api = useApi();
    return await api<ApiResponse<Article>>(`/articles/${id}`, {
      method: "PUT",
      body: form,
    });
  }

  async function setStatus(id: string, status: ArticleStatus) {
    const api = useApi();
    const res = await api<ApiResponse<{ id: string; status: ArticleStatus }>>(
      `/articles/${id}/status`,
      { method: "PATCH", body: { status } },
    );

    const item = items.value.find((a) => a.id === id);
    if (item) item.status = status;
    if (current.value?.id === id) current.value.status = status;

    return res;
  }

  async function remove(id: string) {
    const api = useApi();
    const res = await api<ApiResponse<{ id: string }>>(`/articles/${id}`, {
      method: "DELETE",
    });
    // Xóa xong trang hiện tại có thể rỗng → lùi về trang trước
    if (items.value.length === 1 && page.value > 1) page.value -= 1;
    return res;
  }

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    loading,
    current,
    stats,
    filters,
    fetchList,
    fetchStats,
    fetchOne,
    create,
    update,
    setStatus,
    remove,
  };
});
