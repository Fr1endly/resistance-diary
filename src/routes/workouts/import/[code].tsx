import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/workouts/import/code')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/workouts/import/code"!</div>
}
