import MessageType from "../../../../shared/MessageType.js";
import Connections from "./Connections.js";
import MasterWs from "../master/Ws.js";


class MessagesHandler {

    [MessageType.USER_FEED] = (socket, payload)=>{
        let profile = socket.profile;
        let platform = socket.platform;
        let {edges, tabUrl} = payload;
        let username = tabUrl.split("/")[ tabUrl.split("/").length - 1];
        console.log(`Sending user feed to master profile=${profile} platform=${platform}`)

        MasterWs.send({type: MessageType.USER_FEED, payload: {profile, platform, data: edges, username}});

        socket.endTask();
    }

    [MessageType.POST_CREATED] = (socket, payload)=>{
        let profile = socket.profile;
        let platform = socket.platform;
        
        console.log(`Sending post created to master. profile=${profile} platform=${platform} username=${username} postId=${postId}`);
        socket.endTask();
        MasterWs.send({type: MessageType.POST_CREATED, payload: payload});
    }

    [MessageType.USER_REMOVED] = (socket, payload)=>{
        let profile = socket.profile;
        let platform = socket.platform;
        let {username, tabUrl} = payload;
        console.log(`Sending user removed to master profile=${profile} platform=${platform} username=${username}`)
        
        socket.endTask();
        MasterWs.send({type: MessageType.USER_REMOVED, payload: {profile, platform, username}});
    }
    
    [MessageType.ERR_LOG_IN]= (socket, payload)=>{
        let profile = socket.profile;
        let platform = socket.platform;
        console.log(`Sending error login to master profile=${profile} platform=${platform}`)
        MasterWs.send({type: MessageType.ERR_LOG_IN, payload: {profile, platform}});
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