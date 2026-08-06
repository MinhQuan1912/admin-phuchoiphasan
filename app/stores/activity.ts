import { defineStore } from "pinia";
import type {
  ActivityActor,
  ActivityListFilters,
  ActivityLog,
  ApiResponse,
  Paginated,
} from "~/types";

export const useActivityStore = defineStore("activity", () => {
  const recent = ref<ActivityLog[]>([]);
  const recentLoaded = ref(false);
  const list = ref<Paginated<ActivityLog> | null>(null);
  const actors = ref<ActivityActor[]>([]);

  async function fetchList(filters: ActivityListFilters = {}) {
    const api = useApi();
    const res = await api<ApiResponse<Paginated<ActivityLog>>>("/activities", {
      query: filters,
    });
    list.value = res.data ?? null;
    return list.value;
  }

  async function fetchRecent(limit = 8) {
    const api = useApi();
    const res = await api<ApiResponse<Paginated<ActivityLog>>>("/activities", {
      query: { page: 1, limit },
    });
    recent.value = res.data?.items ?? [];
    recentLoaded.value = true;
    return recent.value;
  }

  async function fetchActors() {
    const api = useApi();
    const res = await api<ApiResponse<ActivityActor[]>>("/activities/actors");
    actors.value = res.data ?? [];
    return actors.value;
  }

  return {
    recent,
    recentLoaded,
    list,
    actors,
    fetchList,
    fetchRecent,
    fetchActors,
  };
});
