never invalidate queries, instead use setQueryData to update the cache directly. This is more efficient and avoids unnecessary refetching of data.

```tsx
  const {mutate: handleAddTask} = useMutation({
  mutationFn: (data: Omit<Task, "id">) => apiClient<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  onSuccess: (data) => {
    console.log(data);
    //queryClient.invalidateQueries({queryKey: ["tasks"]}) DONT DO THAT
    queryClient.setQueryData<Task[]>(["tasks"],  old => [...(old ?? []), data]);
  }
})
```