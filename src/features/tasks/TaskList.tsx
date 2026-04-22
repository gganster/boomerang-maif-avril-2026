import type { Task } from "../../type";
import { TaskListItem } from "./TaskListItem";

type TaskListProps = {
  items: Task[];
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: Omit<Task, "id">) => void;
}

const TaskList = ({items, onDelete, onUpdate}: TaskListProps) => {
  return (
    <div className="mx-auto max-w-5xl flex flex-col gap-4">
      {items.map(i => (
        <TaskListItem
          key={i.id}
          item={i}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}

export { TaskList };