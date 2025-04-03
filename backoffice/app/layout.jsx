import { Inter } from "next/font/google"
import "./globals.css"
import { SocialDataProvider } from "@/context/social-data-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Social Media Backoffice",
  description: "Gestione contenuti social in stile Tinder",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <SocialDataProvider>{children}</SocialDataProvider>
        <Toaster />
      </body>
    </html>
  )
}



import './globals.css'