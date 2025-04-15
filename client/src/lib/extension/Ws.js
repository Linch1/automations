import { WebSocketServer } from 'ws';
import MessagesHandler from './MessagesHandler.js';
import Connections from './Connections.js';
import Utils from '../../../../shared/Utils.js';
import MasterMessageHandler from "../master/MessagesHandler.js"

export default new class {

    constructor(){
        this.server = new WebSocketServer({port: 5010});
        this._socketId = 0;
        this.sockets = {};
        this.connections = Connections;
    }
    
    run(){
        console.log("Running socket server")
        this.server.on('connection', (socket) => {
            console.log("extension socket connected");
            this._lastConnection = {ts: Utils.nowInSecs(), socket};

            socket = Utils.rewrapSocket(socket);
            socket.endTask = () => {
                if(socket.chromeProcess) {
                    delete socket.chromeProcess;
                }
                MasterMessageHandler.endChromeTask();
            }

            socket.id = this._socketId;
            this.sockets[this._socketId] = socket;
            this._socketId ++;

            socket.on("message", (data) => {
                MessagesHandler.handle(socket, data);
            });

            socket.on("close", ()=>{
                this.connections.remove(socket);
                delete this.sockets[socket.id];
            });

            
        });

        // Se vuoi gestire errori, dovresti aggiungere un handler separato per 'error'
        this.server.on('error', (err) => {
            console.error("Socket error:", err);
            rej(err);
        });
    }

    async waitForConnection(profile, platform){
        let start = Utils.nowInSecs();
        while(!this._lastConnection || start > this._lastConnection.ts){
            await Utils.sleep(50);
        }
        this.connections.add(this._lastConnection.socket, profile, platform);
    }
}