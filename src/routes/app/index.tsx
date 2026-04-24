import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../../stores/Auth'
import { Button } from '../../components/Button';

export const Route = createFileRoute('/app/')({
  component: RouteComponent,
})

function RouteComponent() {
  const {user, logout} = useAuth();

  return (
    <>
      <h1>Hello ${user?.email}</h1>
      <Button onClick={logout}>disconnect</Button>
    </>
  )
}
