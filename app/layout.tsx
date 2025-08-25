// Root layout with Tailwind CSS and React Query
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TitleTesterPro v6 - YouTube Title A/B Testing',
  description: 'Production-ready YouTube title testing platform with automated rotation and analytics',
  keywords: 'YouTube, title testing, A/B testing, analytics, video optimization',
  authors: [{ name: 'TitleTesterPro Team' }],
  openGraph: {
    title: 'TitleTesterPro v6',
    description: 'Optimize your YouTube video titles with data-driven A/B testing',
    type: 'website',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}