import {useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import {z} from "zod";
import { useAuth } from "../../stores/Auth";

export const LoginFormSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;

export const LoginForm = () => {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const _handleSubmit = (data: LoginFormData) => {
    login(data.email, data.password);
  }

  return (
    <form onSubmit={handleSubmit(_handleSubmit)} className="flex flex-col gap-4">
      <input type="email" placeholder="Email" {...register("email")} className="border p-2 rounded" />
      {errors.email ? <span className="text-red-500">{errors.email.message}</span> : null}
      <input type="password" placeholder="Password" {...register("password")} className="border p-2 rounded" />
      {errors.password ? <span className="text-red-500">{errors.password.message}</span> : null}
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">Register</button>
    </form>
  )
}