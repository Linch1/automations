import { Badge } from "@/components/ui/badge"
import { Volume, Volume2, VolumeOffIcon } from "lucide-react";
import { useEffect, useRef, useState } from 'react';

export default function VideoPlayer({ post }) {
    const videoRef = useRef(null);
    const [duration, setDuration] = useState(0);
    const [muted, setMuted] = useState(false);
    
    useEffect(() => {
        if (post.video && videoRef.current) {
            ( async () => {
                try {
                    await videoRef.current.play()
                } catch (error) {
                    console.log("Error playing video");
                }
            })();
        }
    }, [post.video])

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
        setDuration(videoRef.current.duration);
        }
    };

    return (
    <>
        <video
            ref={videoRef}
            controls
            muted={muted}
            src={process.env.NEXT_PUBLIC_SERVER + post.video}
            className="w-full h-full object-contain"
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
        />
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            <Badge variant="outline" className="bg-black/70 text-white border-none">
                {duration.toFixed(0)} secondi
            </Badge>

            <Badge 
                variant="outline" 
                className="cursor-pointer bg-black/70 text-white border-none flex items-center justify-center w-fit w-[40px] h-[40px]" 
                onClick={()=>setMuted(o=>!o)}
            >
                {muted?<VolumeOffIcon />:<Volume2 />}
            </Badge>

        </div>

    </>
  );
}