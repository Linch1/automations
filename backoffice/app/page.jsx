"use client"

import { useSocialData } from "@/context/social-data-context"
import { SwipeCards } from "@/components/swipe-cards"
import { Loader } from "@/components/loader"
import { ErrorDisplay } from "@/components/error-display"
import { useState } from "react"


export default function Home() {
  const {loading, error} = useSocialData()

  if (loading) {
    return <Loader />
  }

  if (error) {
    return <ErrorDisplay message={error} />
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-100">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-4">Social Media Backoffice</h1>
        <SwipeCards />
      </div>
    </main>
  )
}

