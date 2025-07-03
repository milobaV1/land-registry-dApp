import { Land } from '@/pages/land/land'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/land')({
  component: Land,
})

// function RouteComponent() {
//   return <div>Hello "/_layout/land"!</div>
// }
