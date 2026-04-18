import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyEstatePlan — Estate Planning Made Simple",
  description:
    "Assemble your estate planning documents in minutes. Start with a free Healthcare Power of Attorney.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
