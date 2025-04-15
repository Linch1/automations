"use client"

import { createContext, useContext, useState, useEffect } from "react"

const SocialDataContext = createContext(undefined)

export function SocialDataProvider({ children }) {
  const [socialData, setSocialData] = useState({})
  const [allPosts, setAllPosts] = useState([]);
  const [likedPostsIds, setLikedPostsIds] = useState([]);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null);


  const [showOnlyLiked, setShowOnlyLiked] = useState(false);
  const [showUploaded, setShowUploaded] = useState(false);

  const [availablePlatforms, setAvailablePlatforms] = useState([])
  const [selectedPlatforms, setSelectedPlatforms] = useState([])

  const [availableCategories, setAvailableCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])

  const fetchMedias = async (liked=false, uploaded=false) => {
    try {
      // Simulazione di una chiamata API
      // In un'applicazione reale, sostituire con l'endpoint effettivo
      const response = await fetch( process.env.NEXT_PUBLIC_SERVER + `/users?liked=${liked}&uploaded=${uploaded}`)

      if (!response.ok) {
        throw new Error("Errore nel caricamento dei dati")
      }

      const data = (await response.json()).response
      setSocialData(data.users)

      setAvailablePlatforms(data.platforms)
      setSelectedPlatforms(data.platforms)

      setAvailableCategories(data.categories)
      setSelectedCategories(data.categories)
      
      // Estrai tutti i post in un unico array
      const posts = extractAllPosts(data.users)
      setAllPosts(posts)
    } catch (err) {
      console.log(err)
      setError(err instanceof Error ? err.message : "Errore sconosciuto")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedias(showOnlyLiked, showUploaded);
  }, [showOnlyLiked, showUploaded])

  // Funzione per estrarre tutti i post in un unico array
  const extractAllPosts = (data) => {
    const posts = []

    for( let platform in data ){
      for( let user in data[platform] ){
        posts.push(...Object.values(data[platform][user]).map( p => { p.platform = platform; return p } ))
      }
    }
    
    return shuffleArray(posts)
  }

  // Funzione per mescolare un array in modo casuale (algoritmo Fisher-Yates)
  const shuffleArray = (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  return (
    <SocialDataContext.Provider
      value={{
        fetchMedias,
        socialData,
        allPosts,
        loading,
        error,
        likedPostsIds, setLikedPostsIds,

        showOnlyLiked, 
        setShowOnlyLiked,

        showUploaded, 
        setShowUploaded,

        selectedPlatforms,
        setSelectedPlatforms,
        availablePlatforms,

        selectedCategories,
        setSelectedCategories,
        availableCategories
      }}
    >
      {children}
    </SocialDataContext.Provider>
  )
}

export function useSocialData() {
  const context = useContext(SocialDataContext)
  if (context === undefined) {
    throw new Error("useSocialData deve essere utilizzato all'interno di un SocialDataProvider")
  }
  return context
}

