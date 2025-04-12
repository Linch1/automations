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

export function ChangeCategory({ normalFlex }) {

    const { 
        selectedCategories, setSelectedCategories, availableCategories,
        showOnlyLiked, setShowOnlyLiked, 
    } = useSocialData();

    const togglePlatform = (item) => {
        if (selectedCategories.includes(item)) {
          // Se tutte le piattaforme stanno per essere deselezionate, non fare nulla
          if (selectedCategories.length === 1) {
            return
          }
          setSelectedCategories(selectedCategories.filter((p) => p !== item))
        } else {
            setSelectedCategories([...selectedCategories, item])
        }
    }

    return (
        <div className={`flex ${normalFlex?"":"flex-col"} items-center gap-3`}>
            {
                availableCategories.map( (category, i) => {
                    let isSelected = selectedCategories.includes(category);
                    return <div 
                            onClick={()=>togglePlatform(category)} 
                            key={category} 
                            className={(isSelected?"bg-green-500":"bg-black") + " cursor-pointer text-lg text-white rounded-full w-[40px] h-[40px] flex items-center justify-center"} 
                        >
                        {category[0].toUpperCase()}
                    </div>  
                })
            }
        </div>
    )
  }
  
  