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
import {ChangeCategory} from "@/components/change-category";

export function SwipeCards() {
  const { showOnlyLiked, allPosts, selectedPlatforms, selectedCategories, likedPostsIds } = useSocialData()

  const [direction, setDirection] = useState(null);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentPostIndex, setCurrentPostIndex] = useState(null);
  const { toast } = useToast();

  // Filtra i post in base alle piattaforme selezionate
  useEffect(() => {
    
    let filtered = allPosts
      .filter((post) => selectedPlatforms.includes(post.platform))
      .filter((post) => selectedCategories.includes(post.category))

    // remove already liked posts if we are in tinder mode
    if(!showOnlyLiked) filtered = filtered.filter((post) => !likedPostsIds.includes(post.id))
      
    setFilteredPosts(filtered);
    setCurrentPostIndex(0);

  }, [allPosts, selectedPlatforms, selectedCategories, likedPostsIds])

  const handleSwipe = (dir) => {
    if( dir == "right" && showOnlyLiked){
      setCurrentPostIndex( o => {
        return o+1 >= filteredPosts.length ? 0 : o+1;
      })
    }
  }

  if (filteredPosts.length === 0) {
    return (
      <>
      <Filters />
      <div className="flex justify-center items-center mt-[60px] mb-2">
        <p className="text-gray-500">
          Nessun contenuto disponibile per le piattaforme selezionate.<br/>
          Prova a cambiare categoria.
        </p>
      </div>
      <ChangeCategory normalFlex={true}/>
      </>
    )
  }

  
  const currentPost = filteredPosts[currentPostIndex];
  return (
    <div className="relative h-[70vh] w-full">

      <div className="flex items-center justify-between">
        <Filters />
        <Badge variant="outline" className="bg-black/70 text-white">
          {showOnlyLiked ? "Liked medias:" : "Posts to swipe:"} {filteredPosts.length}
        </Badge>
      </div>
      
      {
        currentPost ?
        <AnimatePresence>
          {direction === null && (
            <motion.div
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
      : <></>}

      
    </div>
  )
}

