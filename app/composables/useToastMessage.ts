export function useToastMessage() {
  const toast = useToast();
  const sessionEnded = useSessionEnded();
  return {
    success: (description: string) =>
      toast.add({
        title: "Thành công",
        description,
        color: "success",
        icon: "i-lucide-check-circle",
      }),
    error: (description: string) => {
      // Phiên đăng nhập đã kết thúc: modal đã báo rồi, các request hỏng theo
      // không được bắn toast chồng lên.
      if (sessionEnded.value) return;
      return toast.add({
        title: "Lỗi",
        description,
        color: "error",
        icon: "i-lucide-alert-circle",
      });
    },
  };
}
