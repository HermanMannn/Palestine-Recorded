import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PalRec" },
      { name: "description", content: "PalRec is here to show realism" },
      { name: "author", content: "Midas" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "PalRec" },
      { name: "twitter:description", content: "An interactive map application with a zoomable, draggable map, event timeline, and social feed." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/01001e60-a265-49ef-ad89-2fd62e8f35dc/id-preview-cb376cdd--78d1761f-dab0-41d5-ae30-dc6ae59bc7a1.lovable.app-1777217343901.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/01001e60-a265-49ef-ad89-2fd62e8f35dc/id-preview-cb376cdd--78d1761f-dab0-41d5-ae30-dc6ae59bc7a1.lovable.app-1777217343901.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

// The script that runs instantly to apply the theme and prevent the white flash
const themeScript = `
  (function() {
    try {
      var savedTheme = localStorage.getItem('theme') || 'system';
      var html = document.documentElement;
      if (savedTheme === 'system') {
        var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        html.classList.add(systemTheme);
      } else {
        html.classList.add(savedTheme);
      }
    } catch (e) {}
  })();
`;

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Inject the theme script right into the head */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        style={{
          backgroundImage: 'url(/PalRecBG.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}