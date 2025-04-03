import Utils from "./utils/Utils.js";
const Requests = new class  {
    constructor(){
        this._requests = {};
        this._responses = {};
        this._id = 0;
        this._listen();
    }

    _send(id){
        chrome.tabs.query({currentWindow: true, url:"https://www.instagram.com/*"}, (tabs) => {
            
            tabs.forEach(tab => {
                //console.log(`Sent request wiht id=${id} to tab_id=${tab.id}`);
              chrome.tabs.sendMessage(tab.id, this._requests[id]);
            });
            this.getRequest(id);
        });
    }
    _listen(){
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            //console.log("Recived response from content.js", request);
            this.addResponse(request.id, request.response)
        });
    }
    getRequests(){
        return Object.keys(this._requests);
    }
    addRequest(type, payload){
        let id = this._id;
        this._requests[id] = {
            type,
            payload,
            id
        }
        this._id++;
        return id;
    }
    getRequest(id){
        let obj = {...this._requests[id]};
        this._responses[id] = obj
        delete this._requests[id];
        return {...obj};
    }
    hasResponse(id){
        return this._responses[id].response !== null;
    }
    addResponse(id, response){
        this._responses[id].response = response;
    }
    getResponse(id){
        let obj = this._responses[id];
        delete this._responses[id];
        return obj;
    }
    async send(type, payload){
        let id = this.addRequest(type, payload);
        this._send(id);
        await Utils.sleep(1000);

        return new Promise( async (res, rej) => {
            let timeout = 60 * 1000;
            while(timeout>0){
                //console.log("Checking for resposne to request ", id, " has arrived=", this.hasResponse(id), " responses=", JSON.stringify(this._responses));
                if(this.hasResponse(id)) break;
                await Utils.sleep(1000);
                timeout -= 1000;
            }
            if(timeout<=0) rej(`Timeout while doing request ${type} payload=${JSON.stringify(payload)}`);
            //console.log("resolving response for id=", 4);
            res(this.getResponse(id));
        })
    }
    async executeBrowserCommand(cmd){
        return (await this.send("EXECUTE_CODE", {cmd: cmd})).response;
    }
}
export default Requests;