import { createFileRoute, notFound } from '@tanstack/react-router'
import { useTasks } from '../features/tasks/useTasks';

export const Route = createFileRoute('/task/$id')({
  component: RouteComponent,
  notFoundComponent: () => <div>Task not found!</div>,
})

function RouteComponent() {
  const {tasks} = useTasks();
  const { id } = Route.useParams();

  const task = tasks.find(t => t.id === id);

  if (!task) {
    throw notFound();
  }

  return <div>Hello "/task/{id}: {task?.text}"!</div>
}