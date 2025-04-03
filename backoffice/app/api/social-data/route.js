import { NextResponse } from "next/server"

// Dati di esempio per simulare la risposta dell'API
const mockData = {
  Instagram: {
    user1: [
      {
        caption: "Una bellissima giornata al mare! #estate #relax",
        image: "/placeholder.svg?height=600&width=400",
      },
      {
        caption: "Nuovo outfit per la serata! Cosa ne pensate? #fashion #style",
        image: "/placeholder.svg?height=600&width=400",
      },
    ],
    user2: [
      {
        caption: "Il mio nuovo progetto di design #creative #design",
        image: "/placeholder.svg?height=600&width=400",
      },
    ],
  },
  TikTok: {
    user3: [
      {
        caption: "Nuova challenge virale! #challenge #viral",
        video:
          "https://assets.mixkit.co/videos/preview/mixkit-woman-running-through-a-futuristic-corridor-with-neon-lights-32693-large.mp4",
      },
    ],
    user4: [
      {
        caption: "Tutorial makeup veloce #beauty #makeup",
        video: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-taking-a-selfie-at-the-beach-1362-large.mp4",
      },
    ],
  },
  YouTube: {
    user5: [
      {
        caption: "Recensione del nuovo iPhone #tech #apple",
        video: "https://assets.mixkit.co/videos/preview/mixkit-man-under-multicolored-lights-1237-large.mp4",
      },
    ],
  },
  Twitter: {
    user6: [
      {
        caption: "Pensieri sulla nuova politica economica #economia #politica",
        image: "/placeholder.svg?height=600&width=400",
      },
    ],
    user7: [
      {
        caption: "Breaking news: nuovo record mondiale! #sport #record",
        image: "/placeholder.svg?height=600&width=400",
      },
    ],
  },
}

export async function GET() {
  // Simula un ritardo di rete
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(mockData)
}

