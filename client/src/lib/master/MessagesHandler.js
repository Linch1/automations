import MessageType from "../../../../shared/MessageType.js";
import { spawn } from 'child_process';
import ExtensionWs from "../extension/Ws.js";
import Utils from "../../../../shared/Utils.js";
import { type } from "os";

class MessagesHandler {

    [MessageType.OPEN_BROWSER] = async (payload) => {
        console.log("Recived open browser with payload=", payload);
        await this._waitForPreviousConnectionToEstablish(); // wait for previous open browser action to complete

        let {profile, platform, url} = payload;
        
        this._connecting = true;

        const chromeProcess = spawn("google-chrome", [
            "--start-fullscreen",
            `--load-extension=/media/sf_instagram-automation/extension`,
            `--profile-directory=${profile}`,
            "https://google.com"
        ]);

        console.log("Waiting for extension to connect");
        await ExtensionWs.waitForConnection(profile, platform);
        this._connecting = false;

        console.log("Extension connected, sending open url request");
        await Utils.sleep(2000);
        let extensionSocket = await ExtensionWs.connections.get(profile);
        extensionSocket.chromeProcess = chromeProcess;
        extensionSocket.send({type: MessageType.OPEN_URL, payload: {url: url}});
    }

    [MessageType.CREATE_POST] = async (payload) => {
        console.log("Recived open browser with payload=", payload);
        await this._waitForPreviousConnectionToEstablish(); // wait for previous open browser action to complete

        let {profile, platform, url, fileUrl, caption} = payload;
        
        this._connecting = true;

        const chromeProcess = spawn("google-chrome", [
            "--start-fullscreen",
            `--load-extension=/media/sf_instagram-automation/extension`,
            `--profile-directory=${profile}`,
            "https://google.com"
        ]);

        console.log("Waiting for extension to connect");
        await ExtensionWs.waitForConnection(profile, platform);
        this._connecting = false;

        console.log("Extension connected, sending open url request");
        await Utils.sleep(2000);
        let extensionSocket = await ExtensionWs.connections.get(profile);
        extensionSocket.chromeProcess = chromeProcess;

        extensionSocket.send({type: MessageType.CREATE_POST, payload: {url, caption, fileUrl}});
    }

    async _waitForPreviousConnectionToEstablish(){
        while(this._connecting) await Utils.sleep(100);
    }

    handle(stringObj){
        console.log("recived master message: ", stringObj )
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
        return this[message.type](message.payload);
    }

}
export default new MessagesHandler()