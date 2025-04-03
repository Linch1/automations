"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, X } from "lucide-react"
import Image from "next/image"
import { SwipeButtons } from "./swipe-buttons"
import VideoPlayer from "./video-player"
import { useSocialData } from "@/context/social-data-context"

export function ContentCard({ platform, username, post, handleSwipe }) {

  const {showOnlyLiked} = useSocialData();

  const [showCaption, setShowCaption] = useState(false)

  const toggleCaption = () => {
    setShowCaption(!showCaption)
  }

  async function postSwipe(dir){
    if(!showOnlyLiked){
      await fetch( process.env.NEXT_PUBLIC_SERVER + `/swipe?direction=${dir}&username=${post.username}&platform=${post.platform}&postId=${post.id}`);
    } else {
      
    }
    
    handleSwipe(dir);
  }

  return (
    <>
    <Card className="w-full h-full overflow-hidden relative">
      <CardContent className="p-0 h-full relative">
        {
          post.video ? 
          <VideoPlayer post={post}/>
          : post.image ? (
          <div className="relative w-full h-full">
            <Image src={ process.env.NEXT_PUBLIC_SERVER + post.image || "/placeholder.svg"} alt={post.caption} fill className="object-contain" priority />
          </div>
          ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <p className="text-gray-500">Nessun media disponibile</p>
          </div>
          )
        }

        {/* Tag piattaforma e username */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="outline" className="bg-black/70 text-white">
            {platform}
          </Badge>
          <Badge variant="outline" className="bg-black/70 text-white border-none">
            @{username}
          </Badge>
        </div>

        {/* Pulsante per mostrare/nascondere la caption */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-4 right-4 bg-black/50 z-[30] text-white rounded-full border-[1px] border-solid border-white hover:bg-black/70"
          onClick={toggleCaption}
        >
          {showCaption ? <X size={20} className="" /> : <MessageSquare size={20} />}
        </Button>

        {/* Caption */}
        {showCaption && (
          <div className="absolute bottom-0 z-[20] left-0 right-0 p-4 bg-black/70 text-white">
            <p>{post.caption}</p>
          </div>
        )}
      </CardContent>
    </Card>
    
    <div className="absolute bottom-4 left-0 right-0">
        <SwipeButtons post={post} isTinderMode={!showOnlyLiked} onSwipe={postSwipe} />
    </div>
    
    </>
  )
}

