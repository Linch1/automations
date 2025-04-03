"use client"

import { useState, useEffect } from "react"
import { useSocialData } from "@/context/social-data-context"
import { ContentCard } from "@/components/content-card"
import { SwipeButtons } from "@/components/swipe-buttons"
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "./ui/badge";
import { Filters } from "@/components/filters";
 
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"


export function SwipeCards() {
  const { showOnlyLiked, allPosts, selectedPlatforms, selectedCategories } = useSocialData()

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const { toast } = useToast();

  // Filtra i post in base alle piattaforme selezionate
  useEffect(() => {
    
    const filtered = allPosts
      .filter((post) => selectedPlatforms.includes(post.platform))
      .filter((post) => selectedCategories.includes(post.category))

    setFilteredPosts(filtered)
    setCurrentIndex(0) // Resetta l'indice quando cambia il filtro
  }, [allPosts, selectedPlatforms, selectedCategories])

  const handleSwipe = (dir) => {
    setDirection(dir)

    // Simula un breve ritardo per l'animazione
    setTimeout(() => {
      if (currentIndex < filteredPosts.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // Ricomincia da capo se hai raggiunto la fine
        setCurrentIndex(0)
      }
      setDirection(null)
    }, 300)
  }

  if (filteredPosts.length === 0) {
    return (
      <>
      <Filters />
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Nessun contenuto disponibile per le piattaforme selezionate.</p>
      </div>
      </>
    )
  }

  const currentPost = filteredPosts[currentIndex]

  return (
    <div className="relative h-[70vh] w-full">

      <div className="flex items-center justify-between">
        <Filters />
        <Badge variant="outline" className="bg-black/70 text-white">
          {showOnlyLiked ? "Liked medias:" : "Posts to swipe:"} {filteredPosts.length}
        </Badge>
      </div>
      
      <AnimatePresence>
        {direction === null && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              x: direction === "left" ? -300 : direction === "right" ? 300 : 0,
              opacity: 0,
            }}
            transition={{ duration: 0.3 }}
            className="absolute w-full h-full"
          >
            <ContentCard platform={currentPost.platform} username={currentPost.username} post={currentPost} handleSwipe={handleSwipe} />
          </motion.div>
        )}
      </AnimatePresence>

      
    </div>
  )
}

