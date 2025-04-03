import { WebSocketServer } from 'ws';
import MessagesHandler from './MessagesHandler.js';
import Utils from '../../../shared/Utils.js';

const Connections = new class {

    constructor(){
        this._connections = {};
    }
    add(socket, clientConfig){
        for(let profile of clientConfig.profiles){
            this._connections[profile] = socket;
        }
        socket.clientConfig = clientConfig;
    }
    remove(socket){
        if(!socket.clientConfig) return;
        for(let profile of socket.clientConfig.profiles){
            delete this._connections[profile];
        }
    }
    get(profile){
        return this._connections[profile];
    }

}

export default new class {
    constructor(){
        this._socketId = 0;
        this.sockets = {};
        this.connections = Connections;
    }
    
    run(){
        this.server = new WebSocketServer({port: 6000});
        this.server.on('connection', (socket) => {
            console.log("socket connected");
            socket = Utils.rewrapSocket(socket);

            socket.id = this._socketId;
            this.sockets[this._socketId] = socket;
            this._socketId ++;

            socket.on("message", (data) => {
                MessagesHandler.handle(socket, data);
            });

            socket.on("close", ()=>{
                Connections.remove(socket);
                delete this.sockets[socket.id];
            });
        });

        // Se vuoi gestire errori, dovresti aggiungere un handler separato per 'error'
        this.server.on('error', (err) => {
            console.error("Socket error:", err);
            rej(err);
        });
    }

    send(profile, type, payload){
        Connections.get(profile).send({type,payload});
    }

}