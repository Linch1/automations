import Ws from "../src/lib/Ws.js";
import ServerUtils from "../src/utils/ServerUtils.js";
import "../src/lib/ServerStatic.js"
import {config} from "dotenv";
config();

const args = process.argv.slice(2); // Skip the first two default arguments
if (args.length === 0) {
    console.log("No arguments provided.");
} else {
    console.log("Arguments:", args);
}
const username = args[0];

Ws.run();
setTimeout(async () => {
    let profileJson = await ServerUtils.findProfileThatManageUsername(username);
    let platform = profileJson.platforFound;
    let profile = profileJson.name;
    let socket = Ws.connections.get(profile);

    console.log(`[scrape] sent open browser command on platform=${platform} profile=${profile} username=${username}`);
    socket.send({
        type: MessageType.OPEN_BROWSER, 
        payload: { 
            platform, profile, username, 
            feedUrl: `https://instagram.com/${username}`, 
            reelsUrl: `https://instagram.com/${username}/reels/`
    }});
}, 10_000);
