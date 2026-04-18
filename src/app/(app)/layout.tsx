// Minimal app layout. Individual app pages keep their own sticky header/chrome
// for now (see dashboard/page.tsx). Middleware enforces auth before children render.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
