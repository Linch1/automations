class Connections {

    constructor(){
        this._connections = {};
    }
    add(socket, profile, platform){
        this._connections[profile] = socket;
        socket.profile = profile;
        socket.platform = platform;
    }
    remove(socket){
        if(!socket.profile) return;
        delete this._connections[socket.profile];
    }
    get(profile){
        return this._connections[profile];
    }

}
export default new Connections()