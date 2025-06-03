import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/register"!</div>
}
