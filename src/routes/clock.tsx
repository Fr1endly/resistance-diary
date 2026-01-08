import { createFileRoute } from '@tanstack/react-router'
import { Stopwatch } from '@/components/Stopwatch'

export const Route = createFileRoute('/clock')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <Stopwatch />
    </div>
  )
}
