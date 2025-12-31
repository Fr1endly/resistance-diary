import { createRootRouteWithContext, Outlet, type ErrorComponentProps } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

interface RouterContext {
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}

const seo = (meta: { title: string; description: string }) => {
  return [
    {
      name: "description",
      content: meta.description,
    },
    {
      property: "og:title",
      content: meta.title,
    },
    {
      property: "og:description",
      content: meta.description,
    },
  ];
};

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: () => {
    return {
      user: {
        id: "1",
        email: "os@os.com",
        name: "os",
      }
    }
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title:
          "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  errorComponent: (props: ErrorComponentProps) => <MyErrorComponent {...props} />,
  notFoundComponent: () => null,
  component: () => (
    <RootDocument>
      <Outlet />
      {/* {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />} */}
    </RootDocument>
  ),
});


interface rootDocumentProps {
  children: React.ReactNode
}

const RootDocument = ({ children }: rootDocumentProps) => {
  return (
    <div className="h-full w-full">
      {children}
    </div>
  )
}

export function MyErrorComponent(props: ErrorComponentProps) {
  return (<div>
    <h1>App Error</h1>
    <pre>{props.error.message}</pre>

    <h2>Full Error</h2>
    <pre>{JSON.stringify(props.error, null, 2)}</pre>

    <h2>info</h2>
    <pre>{JSON.stringify(props.info, null, 2)}</pre>

  </div>)
}