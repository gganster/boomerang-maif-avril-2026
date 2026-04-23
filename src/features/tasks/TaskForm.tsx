import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import type {Task} from "../../type";
import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { TaskFormSchema } from "./TaskFormSchema";
import type {TaskFormData} from "./TaskFormSchema";

type TaskFormProps = {
  onSubmit: (data: Omit<Task, "id">) => void;
  defaultValues?: Task;
}

const TaskForm = ({ onSubmit, defaultValues }: TaskFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      text: defaultValues?.text || ""
    }
  });

  const _handleSubmit = (data: TaskFormData) => {
    console.log("here");
    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit(_handleSubmit)} className="flex justify-center gap-2 ">
      <Input placeholder="Enter a new task..." {...register("text")} />
      {errors.text ? <span className="text-red-500">{errors.text.message}</span> : null}
      <Button type="submit">submit</Button>
    </form>
  )
}

export {TaskForm};