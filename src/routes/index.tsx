import { ErrorBoundary } from "react-error-boundary";
import { TaskForm } from "../features/tasks/TaskForm"
import { TaskList } from "../features/tasks/TaskList"
import { useTasks } from "../features/tasks/useTasks";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorDisplay } from "../components/ErrorDisplay";
import { Suspense } from "react";

export const Route = createFileRoute('/')({
  component: App,
})

function AppView() {
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

const AppLoading = () => <p>Loading ... //TODO</p>

const AppError = ErrorDisplay;

const App = () => (
  <ErrorBoundary fallbackRender={AppError}>
    <Suspense fallback={<AppLoading />}>
      <AppView />
    </Suspense>
  </ErrorBoundary>
)