import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/assinatura')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/assinatura"!</div>
}
