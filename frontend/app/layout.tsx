import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "NeuroLearn | Adaptive AI Learning Platform",
  description:
    "Master new skills with AI-powered adaptive learning, attention monitoring, and gamified challenges",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased noise-bg">{children}</body>
    </html>
  )
}
