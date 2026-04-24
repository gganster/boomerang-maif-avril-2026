import { createFileRoute, redirect } from '@tanstack/react-router'
import {LoginForm} from "../features/auth/LoginForm";
import { useAuth } from '../stores/Auth';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();
  const {user} = useAuth();

  if (user) {
    navigate({to: "/app"})
    return <></>
  };

  return (
    <>
      <h1>Login</h1>
      <LoginForm />
    </>
  )
}
