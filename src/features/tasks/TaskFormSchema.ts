import {z} from "zod";

export const TaskFormSchema = z.object({
  text: z.string().min(1, "Title is required")
});

export type TaskFormData = z.infer<typeof TaskFormSchema>;

// zod react-hook-form @hookform/resolvers