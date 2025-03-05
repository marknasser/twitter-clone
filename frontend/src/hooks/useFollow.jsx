import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

function useFollow() {
  const queryClient = useQueryClient();

  const {
    mutate: follow,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (userID) => {
      try {
        const res = await fetch(`/api/users/follow/${userID}`, {
          method: "POST",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "something went wrong");

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
      ]);

      toast.success(error.message);
    },
    onError: () => {
      toast.error(error.message);
    },
  });

  return { follow, isPending };
}

export default useFollow;
