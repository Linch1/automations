import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react"
import { FilterIcon, Share, X } from "lucide-react"
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

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast"
import Utils from "@/utils/Utils";


export function ShareButton({
    onSwipe, post
}) {

    const {availablePlatforms} = useSocialData();
    const [platform, setPlatform] = useState();
    const [open, setOpen] = useState(false);
    const { toast } = useToast()

    const share = async () => {
        setOpen(false);
        await fetch( process.env.NEXT_PUBLIC_SERVER + `/upload?username=${post.username}&platform=${post.platform}&postId=${post.id}&isVideo=${typeof(post.video)=="string"}`);
        console.log("Sharing post", post);
    }
    return (
        <Dialog open={open}>
            <DialogTrigger asChild>
                <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full bg-white border-2 border-green hover:bg-green-50"
                onClick={()=>{
                    if(post.uploadedTs){
                        toast({
                            title: "Post already uploaded",
                            description: "Post was uploaded on " +  Utils.formatTimestamp(post.uploadedTs)
                        })
                    } else {
                        setOpen(true)
                    }
                }}
                >
                    <Share />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Publish media on platform</DialogTitle>
                    <DialogDescription>Select which platform to share the media on</DialogDescription>
                </DialogHeader>
                <div className="">

                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                        {availablePlatforms.map( (p,i) => <SelectItem key={p} value={p}>{p}</SelectItem> )}
                    </SelectContent>
                </Select>

                <Button className="mt-3" onClick={share}>Confirm Share</Button>

                </div>
            </DialogContent>
        </Dialog>
    )
  }
  
  