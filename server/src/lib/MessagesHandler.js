import MessageType from "../../../shared/MessageType.js";
import Utils from "../../../shared/Utils.js";
import ServerUtils from "../utils/ServerUtils.js";
import Paths from "./Paths.js";
import Ws from "./Ws.js";
import fs from "fs";

class MessagesHandler {

    [MessageType.CONFIG] = (socket, payload) => {
        Ws.connections.add(socket, payload);
        console.log("[from_client] recived config", JSON.stringify(payload));
    }

    [MessageType.USER_FEED]= async (socket, payload)=>{
        //let clientConfig = socket.clientConfig;
        let {platform, profile, data, username} = payload;
        console.log(`Recived USER_FEED for profile=${profile} on platform=${platform} data=${JSON.stringify(data)}`);

        
        let formatData =Object.fromEntries(data.map(item => {
            let post = ServerUtils.getPostMainInformations(item.node)
            post.username  =username;
            return [post.id, post]
        })); 
        ServerUtils.addUserFeedToDownloadJson(platform, formatData);
        let scrapedUser = username;

        const tracking = fs.existsSync(Paths.TRACKING_PATH) ? JSON.parse(fs.readFileSync(Paths.TRACKING_PATH)) : {};
        tracking[platform][scrapedUser].count = (tracking[platform][scrapedUser].count || 0) + 1;
        tracking[platform][scrapedUser].lastScrapedTs = Utils.nowInSecs();
        fs.writeFileSync(Paths.TRACKING_PATH, JSON.stringify(tracking, null, 2));

        for( let id in formatData ){
            let post = formatData[id];
            let assetPath = Paths.getDownloadPath(platform, username, post.id, post.videoVersions?"video":"image")
            if( !fs.existsSync(assetPath) ) {
                console.log("[downloading] " + assetPath );
                await ServerUtils.download(assetPath, post.videoVersions?post.videoVersions[0].url:post.imageVersions.candidates[0].url);
                await Utils.sleep(Utils.getRandomInt(30_000, 60_000));
            } else {
                console.log("[skipping] " + assetPath );
            }
        }
        
    }

    [MessageType.POST_CREATED] = (socket, payload)=>{
        let {username, postId, platform, profile} = payload;
        console.log(`recived post created from client. profile=${profile} platform=${platform} username=${username} postId=${postId}`);
        ServerUtils.addUploadedPostToUser(platform, username, postId);
    }

    [MessageType.USER_REMOVED] = async (socket, payload)=>{
        let {profile, platform, username} = payload;
        console.log(`Recived USER REMOVED from client for profile=${profile} platform=${platform} username=${username}`);
        await ServerUtils.removeUsernameFromHisProfile(username);
    }

    [MessageType.ERR_LOG_IN]= (socket, payload)=>{
        let {profile, platform} = payload;
        console.log(`Recived error login to master profile=${profile} platform=${platform}`)
    }

    handle(socket, stringObj){
        let message = null // {type, payload}
        try {
            message = JSON.parse(stringObj.toString());
        } catch (error) {
            console.log("Error parsing messagr from ws. message="+message);
            return;
        }
        if(!this[message.type]){
            return console.warn("Recived unhandled message type", message);
        }
        return this[message.type](socket, message.payload);
    }

}
export default new MessagesHandler()