import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Atendimento Whatsapp',
  description: 'Atendimento automatizado via WhatsApp',
  generator: 'Whatsapp Dev.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
