import { TaskForm } from "../features/tasks/TaskForm"
import { TaskList } from "../features/tasks/TaskList"
import { useTasks } from "../features/tasks/useTasks";
import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Textarea } from "../components/Textarea";

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const {
    tasks,
    handleAddTask,
    handleDeleteTask,
    handleUpdateTask
  } = useTasks();

  return (
    <div className="flex flex-col gap-4 p-4">
      <TaskForm onSubmit={handleAddTask} />
      <TaskList
        items={tasks}
        onDelete={handleDeleteTask}
        onUpdate={(id, data) => handleUpdateTask({id, data})}
      />
    </div>
  )
}