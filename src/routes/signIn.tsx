import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signIn')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/signIn"!</div>
}
