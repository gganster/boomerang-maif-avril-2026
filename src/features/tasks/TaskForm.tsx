import React, { useState } from "react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import type {Task} from "../../type";

type TaskFormProps = {
  onSubmit: (data: Omit<Task, "id">) => void;
  defaultValues?: Task;
}

const TaskForm = ({ onSubmit, defaultValues }: TaskFormProps) => {
  const [text, setText] = useState(defaultValues?.text || "");

  const handleSubmit = () => {
    if (!text) return;
    onSubmit({text});
    setText("");
  }

  return (
    <div className="flex justify-center gap-2 ">
      <Input placeholder="Enter a new task..." value={text} onChange={e => setText(e.target.value)} />
      <Button onClick={handleSubmit}>submit</Button>
    </div>
  )
}

export {TaskForm};