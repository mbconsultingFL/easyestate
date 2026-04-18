// Minimal auth layout — pages provide their own full-screen centering.
// No site chrome here so the login/register forms stay focused.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
