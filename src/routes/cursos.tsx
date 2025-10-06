import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/cursos')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/cursos"!</div>
}
