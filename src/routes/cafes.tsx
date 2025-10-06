import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/cafes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/cafes"!</div>
}
