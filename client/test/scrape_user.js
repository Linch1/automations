import MessageType from "../../shared/MessageType";
import MessagesHandler from "../src/lib/master/MessagesHandler";
import ExtensionWsServer from "../src/lib/extension/Ws.js";

console.log("starting extensions server")
ExtensionWsServer.run();


setTimeout(() => {
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
}, 1000);