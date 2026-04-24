import { apiClient } from "../../apiClient";
import type { Task } from "../../type";
import { useQueryClient, useMutation, useSuspenseQuery } from "@tanstack/react-query";

const useTasks = () => {
  const queryClient = useQueryClient();

  const { data: tasks } = useSuspenseQuery({
    queryKey: ["tasks"],
    queryFn: () => apiClient<Task[]>({url: "/tasks", method: "GET", body: undefined})
  })

  const {mutate: handleAddTask} = useMutation({
    mutationFn: (data: Omit<Task, "id">) => apiClient<Task>({
      url: "/tasks",
      method: "POST",
      body: data
    }),
    onSuccess: (data) => {
      console.log(data);
      //queryClient.invalidateQueries({queryKey: ["tasks"]})
      queryClient.setQueryData<Task[]>(["tasks"],  old => [...(old ?? []), data]);
    }
  })

  const {mutate: handleDeleteTask} = useMutation({
    mutationFn: (id: string) => apiClient<void>({
      url: `/tasks/${id}`,
      method: "DELETE",
      body: undefined
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["tasks"]})
    },
  })

  const {mutate: handleUpdateTask} = useMutation({
    mutationFn: ({id, data}: {id: string; data: Omit<Task, "id">}) => apiClient<Task>({
      url: `/tasks/${id}`,
      method: "PUT",
      body: data
    }),
    onSuccess: (updated) => {
      queryClient.setQueryData<Task[]>(["tasks"], old => old?.map(t => t.id === updated.id ? updated : t) ?? []);
    },
  })

  return {
    tasks: tasks,
    handleAddTask,
    handleDeleteTask,
    handleUpdateTask
  }
}

export { useTasks };
