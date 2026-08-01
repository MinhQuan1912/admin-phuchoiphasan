import { defineStore } from "pinia";
import type { ApiResponse, Category, CategoryRef } from "~/types";

export const useCategoryStore = defineStore("category", () => {
  const items = ref<Category[]>([]);
  const loading = ref(false);

  async function fetchAll(force = false) {
    if (items.value.length && !force) return items.value;
    const api = useApi();
    loading.value = true;
    try {
      const res = await api<ApiResponse<Category[]>>("/categories");
      items.value = res.data ?? [];
      return items.value;
    } finally {
      loading.value = false;
    }
  }

  async function create(name: string) {
    const api = useApi();
    const res = await api<ApiResponse<CategoryRef>>("/categories", {
      method: "POST",
      body: { name },
    });
    await fetchAll(true);
    return res;
  }

  async function update(id: string, name: string) {
    const api = useApi();
    const res = await api<ApiResponse<CategoryRef>>(`/categories/${id}`, {
      method: "PUT",
      body: { name },
    });
    await fetchAll(true);
    return res;
  }

  async function remove(id: string) {
    const api = useApi();
    const res = await api<ApiResponse<{ id: string }>>(`/categories/${id}`, {
      method: "DELETE",
    });
    await fetchAll(true);
    return res;
  }

  return { items, loading, fetchAll, create, update, remove };
});
