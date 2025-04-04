import MessageType from "../../../../shared/MessageType.js";
import Connections from "./Connections.js";
import MasterWs from "../master/Ws.js";

class MessagesHandler {

    [MessageType.USER_FEED] = (socket, payload)=>{
        let profile = socket.profile;
        let platform = socket.platform;
        console.log(`Sending user feed to master profile=${profile} platform=${platform}`)
        socket.chromeProcess.kill(); // chrome process is setted in master/messageshandler on the OPEN_BROWSER request is recived
        MasterWs.send({type: MessageType.USER_FEED, payload: {profile, platform,data:payload}});
    }

    [MessageType.POST_CREATED] = (socket, payload)=>{
        let profile = socket.profile;
        let platform = socket.platform;
        console.log(`Sending user feed to master profile=${profile} platform=${platform}`)
        socket.chromeProcess.kill(); // chrome process is setted in master/messageshandler on the OPEN_BROWSER request is recived
        //MasterWs.send({type: MessageType.USER_FEED, payload: {profile, platform,data:payload}});
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