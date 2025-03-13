import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TreatyError } from "../shared/types/error";

export function handleTreatyError(error: Error) {
  console.error(error);
  if (error instanceof TreatyError) {
    toast.error("Ошибка", {
      description: error.error?.value,
    });
    return;
  }

  toast.error("Внутренняя ошибка сервера");
}

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        handleTreatyError(error);
      },
    },
  },
});
