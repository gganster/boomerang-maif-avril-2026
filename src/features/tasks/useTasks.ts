import { apiClient } from "../../apiClient";
import type { Task } from "../../type";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";

const useTasks = () => {
  const queryClient = useQueryClient();

  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiClient<Task[]>("/tasks")
  })

  const {mutate: handleAddTask} = useMutation({
    mutationFn: (data: Omit<Task, "id">) => apiClient<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["tasks"]})
    }
  })

  const {mutate: handleDeleteTask} = useMutation({
    mutationFn: (id: string) => apiClient<void>(`/tasks/${id}`, {
      method: "DELETE"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["tasks"]})
    },
  })

  const {mutate: handleUpdateTask} = useMutation({
    mutationFn: ({id, data}: {id: string; data: Omit<Task, "id">}) => apiClient<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["tasks"]})
    },
  })

  return {
    tasks: tasks || [],
    handleAddTask,
    handleDeleteTask,
    handleUpdateTask
  }
}

export { useTasks };
