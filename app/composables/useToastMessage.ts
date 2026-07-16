export function useToastMessage() {
  const toast = useToast();
  return {
    success: (description: string) =>
      toast.add({
        title: "Thành công",
        description,
        color: "success",
        icon: "i-lucide-check-circle",
      }),
    error: (description: string) =>
      toast.add({
        title: "Lỗi",
        description,
        color: "error",
        icon: "i-lucide-alert-circle",
      }),
  };
}
