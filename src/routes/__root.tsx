import { useState } from 'react'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { AlertTriangle, ChevronDown, RefreshCw } from 'lucide-react'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { cn } from '@/lib/utils'

interface RouterContext {
  user: {
    id: string
    email: string
    name: string
  } | null
}

const seo = (meta: { title: string; description: string }) => {
  return [
    {
      name: 'description',
      content: meta.description,
    },
    {
      property: 'og:title',
      content: meta.title,
    },
    {
      property: 'og:description',
      content: meta.description,
    },
  ]
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: () => {
    return {
      user: {
        id: '1',
        email: 'os@os.com',
        name: 'os',
      },
    }
  },
  head: () => ({
    title: 'Fitness Tracker',
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'theme-color',
        content: '#000000',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      ...seo({
        title: 'Fitness Tracker - Log Resistance Training & Track Progress',
        description:
          'Track your resistance training workouts, log sets and reps, and monitor your fitness progress over time.',
      }),
    ],
    links: [
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: (props: ErrorComponentProps) => (
    <MyErrorComponent {...props} />
  ),
  notFoundComponent: () => null,
  component: () => (
    <RootDocument>
      <Outlet />
      {/* {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />} */}
    </RootDocument>
  ),
})

interface rootDocumentProps {
  children: React.ReactNode
}

const RootDocument = ({ children }: rootDocumentProps) => {
  return (
    <div className="h-full w-full">
      {children}
      <ToastContainer />
    </div>
  )
}

export function MyErrorComponent({ error, reset }: ErrorComponentProps) {
  const [showDetails, setShowDetails] = useState(false)

  const handleReload = () => {
    reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-linear-to-br from-stone-950 to-stone-900">
      <div
        className={cn(
          'max-w-md w-full p-8 text-center',
          'backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl',
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            'w-16 h-16 mx-auto mb-4 rounded-full',
            'bg-red-500/20 border border-red-400/30',
            'flex items-center justify-center',
          )}
        >
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        {/* Message */}
        <h1 className="font-display text-xl font-semibold text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-white/50 text-sm mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleReload}
            className={cn(
              'w-full px-6 py-3 rounded-xl font-medium',
              'bg-amber-500/20 border border-amber-400/30 text-amber-100',
              'hover:bg-amber-500/30 hover:border-amber-400/50',
              'transition-all duration-200 active:scale-95',
              'flex items-center justify-center gap-2',
            )}
          >
            <RefreshCw size={18} />
            Try Again
          </button>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className={cn(
              'w-full px-4 py-2 rounded-lg text-sm',
              'text-white/40 hover:text-white/60 hover:bg-white/5',
              'transition-colors flex items-center justify-center gap-1',
            )}
          >
            {showDetails ? 'Hide' : 'Show'} Details
            <ChevronDown
              size={16}
              className={cn(
                'transition-transform',
                showDetails && 'rotate-180',
              )}
            />
          </button>
        </div>

        {/* Error Details */}
        {showDetails && (
          <div
            className={cn(
              'mt-4 p-4 rounded-xl text-left',
              'bg-black/20 border border-white/5',
            )}
          >
            <pre className="text-xs text-white/40 font-body whitespace-pre-wrap wrap-break-word overflow-auto max-h-48">
              {error.stack || JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
