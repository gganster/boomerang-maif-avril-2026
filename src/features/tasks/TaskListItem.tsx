import {useEffect, useState} from "react";
import { Button } from "../../components/Button";
import { TaskForm } from "./TaskForm";
import type { Task } from "../../type";

type TaskListItemProps = {
  item: Task,
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: Omit<Task, "id">) => void;
}

const TaskListItem = ({item, onDelete, onUpdate}: TaskListItemProps) => {
  const [countDown, setCountDown] = useState(5*60);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCountDown(prev => prev - 1);
      console.log(countDown);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    }
  }, [])

  return (
    <div className="border p-2 rounded mx-auto max-w-5xl flex justify-between gap-4">
      {isEditing ?
        <TaskForm
          defaultValues={item}
          onSubmit={(data) => {onUpdate?.(item.id, data); setIsEditing(false)}}
        />
      :
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => onUpdate?.(item.id, {text: item.text, done: !item.done})}
          />
          <span className={item.done ? "line-through text-gray-500" : ""}>
            {item.text} - {countDown}
          </span>
        </label>
      }
      <div className="flex gap-2">
        {onUpdate && !isEditing ?
          <Button onClick={() => setIsEditing(true)}>update</Button>
        : null}
        {onDelete && !isEditing ?
          <Button onClick={() => onDelete(item.id)}>delete</Button>
        : null}
      </div>
    </div>
  )
}

export { TaskListItem };