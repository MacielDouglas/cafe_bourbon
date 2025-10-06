import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/compras')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/compras"!</div>
}
