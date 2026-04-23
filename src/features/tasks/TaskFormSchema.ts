import {z} from "zod";

export const TaskFormSchema = z.object({
  text: z.string().min(1, "Title is required"),
  done: z.boolean().default(false).optional()
});

export type TaskFormData = z.infer<typeof TaskFormSchema>;

// zod react-hook-form @hookform/resolvers