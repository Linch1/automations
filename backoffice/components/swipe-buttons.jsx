"use client"

import { Button } from "@/components/ui/button"
import { Heart, Share, SkipBack, SkipForward, X } from "lucide-react"
import { ShareButton } from "@/components/share-button";

export function SwipeButtons({ isTinderMode, onSwipe, post }) {
  return (
    <div className="flex justify-center gap-8">

      {
        !isTinderMode ?
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full bg-white border-2 border-green-500 hover:bg-green-50"
          onClick={() => {
            onSwipe("left")
          }}
        >
          <SkipBack className="h-8 w-8 " />
        </Button>
        : <></>
      }
      {
        isTinderMode ?
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full bg-white border-2 border-red-500 hover:bg-red-50"
          onClick={() => {
            if(isTinderMode) onSwipe("left")
          }}
        >
          <X className="h-8 w-8 text-red-500" />
        </Button>
        : <ShareButton post={post} onSwipe={onSwipe} />
      }
      <Button
        variant="outline"
        size="icon"
        className="h-14 w-14 rounded-full bg-white border-2 border-green-500 hover:bg-green-50"
        onClick={() => onSwipe("right")}
      >
        {isTinderMode ? <Heart className="h-8 w-8 text-green-500" /> : <SkipForward />}
      </Button>
    </div>
  )
}

