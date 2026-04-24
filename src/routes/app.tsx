import { createFileRoute } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../stores/Auth';

export const Route = createFileRoute('/app')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();
  const {user} = useAuth();

  if (!user) {
    navigate({to: "/login"})
    return <></>
  }

  return (
    <div className="border-red-500 border-8">
      <Outlet />
    </div>
  )
}
