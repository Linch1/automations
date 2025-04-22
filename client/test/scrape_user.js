import MessageType from "../../shared/MessageType";
import MessagesHandler from "../src/lib/master/MessagesHandler";

let username = "minetomeme";
MessagesHandler[MessageType.OPEN_BROWSER](
    { 
        platform: "instagram", 
        profile:"pixeledsign", 
        username, 
        feedUrl: `https://instagram.com/${username}`, 
        reelsUrl: `https://instagram.com/${username}/reels/` 
    }
)