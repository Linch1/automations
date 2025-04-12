import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react"
import { FilterIcon, Heart, HeartHandshake, HeartIcon, HeartPulse, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Filter } from "@/components/filter"
import { useSocialData } from "@/context/social-data-context"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";


export function Filters() {

    const { 
        availablePlatforms, selectedPlatforms, setSelectedPlatforms,
        selectedCategories, setSelectedCategories, availableCategories,
        showOnlyLiked, setShowOnlyLiked, 
    } = useSocialData()

    return (
        <div className="flex items-center gap-3">

            <Badge 
                variant="outline" 
                className={(showOnlyLiked?"bg-green-600 text-white":"bg-white text-black") + " mb-3 cursor-pointer  border-green flex items-center justify-center w-fit w-[40px] h-[40px]"}
                onClick={()=>setShowOnlyLiked(o=>!o)}
            >
                {showOnlyLiked?<HeartHandshake/>:<Heart />}
            </Badge>

            <Dialog>
                <DialogTrigger asChild>
                    <Badge 
                        variant="outline" 
                        className="mb-3 cursor-pointer bg-black/70 text-white border-none flex items-center justify-center w-fit w-[40px] h-[40px]" 
                    >
                        <FilterIcon />
                    </Badge>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Filters Media</DialogTitle>
                        <DialogDescription> Filter the showed medias. </DialogDescription>
                    </DialogHeader>
                    <div className="">
                        <Filter {...{name: "Platforms", available: availablePlatforms, selected: selectedPlatforms, setSelected: setSelectedPlatforms}}/>
                        <Filter {...{name: "Categories", available: availableCategories, selected: selectedCategories, setSelected: setSelectedCategories}}/>
                        <div className="flex items-center space-x-2">

                        <div>
                            <Checkbox  id="liked" checked={showOnlyLiked} onCheckedChange={()=>setShowOnlyLiked(o=>!o)} />
                            <label
                                htmlFor="liked"
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Show only liked media
                            </label>
                        </div>

                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
     
    )
  }
  
  