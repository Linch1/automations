import MessageType from "../../../../shared/MessageType.js";
import { spawn } from 'child_process';
import ExtensionWs from "../extension/Ws.js";
import Utils from "../../../../shared/Utils.js";
import { type } from "os";


class MessagesHandler {

    constructor(){

        this._chromeBusy = false;
        this._chromeProcess = null;
        this._runningChromeTaskTimeoutTs = null;

        this._queue = [];
        this.loopTasks();
    }

    spawnChrome(profile, timeoutSecs=60*10/*10 minutes*/){
        let chromeProcess = spawn("google-chrome", [
            "--start-fullscreen",
            `--load-extension=/media/sf_automations/extension`,
            `--profile-directory=${profile}`,
            "https://google.com"
        ]);
        
        this._chromeProcess = chromeProcess;
        this._runningChromeTaskTimeoutTs = Utils.nowInSecs() + timeoutSecs;

        return chromeProcess;
    }

    async startChromeTask(){
        await this.waitForChromTaskToEnd();
        this._chromeBusy = true;
    }

    async waitForChromTaskToEnd(){
        while(this._chromeBusy){
            await Utils.sleep(5000);
        }
    }

    async endChromeTask(){
        this._chromeBusy = false;
        this._chromeProcess.kill();
        delete this._runningChromeTaskTimeoutTs;
    }

    async loopTasks(){

        let task = null;
        while(true){

            if(!this._chromeBusy){
                task = this._queue.shift();
                if(task){
                    await this.startChromeTask();
                    this[task.type](task.payload);
                }
            }

            if( this._chromeBusy && this._runningChromeTaskTimeoutTs && Utils.nowInSecs() > this._runningChromeTaskTimeoutTs ){ /*Retry task, it has timeout*/
                this.endChromeTask();
                await this.startChromeTask();
                this[task.type](task.payload);
            }

            await Utils.sleep(1000);
        }
    }

    addTask(task){
        this._queue.push(task);
    }

    [MessageType.OPEN_BROWSER] = async (payload) => {
        console.log("Recived open browser with payload=", payload);
        await this._waitForPreviousConnectionToEstablish(); // wait for previous open browser action to complete

        let {profile, platform, url, username} = payload;
        
        this._connecting = true;

        const chromeProcess = this.spawnChrome(profile)

        console.log("Waiting for extension to connect");
        await ExtensionWs.waitForConnection(profile, platform);
        this._connecting = false;

        console.log("Extension connected, sending open url request");
        await Utils.sleep(2000);
        let extensionSocket = await ExtensionWs.connections.get(profile);
        extensionSocket.chromeProcess = chromeProcess;
        extensionSocket.send({type: MessageType.OPEN_URL, payload: {url: url, username}});
    }

    [MessageType.CREATE_POST] = async (payload) => {
        console.log("Recived open browser with payload=", payload);
        await this._waitForPreviousConnectionToEstablish(); // wait for previous open browser action to complete

        let {profile, platform, url, fileUrl, caption} = payload;
        
        this._connecting = true;

        const chromeProcess = this.spawnChrome(profile)

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

        this.addTask(message);
    }

}
export default new MessagesHandler()