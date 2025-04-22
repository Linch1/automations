import Utils from "./utils/Utils.js";
const NetworkRequests = new class  {
    constructor(){
        this._registeredKeys = [];
        this._listeners = {};
    }

    addListener(key, fn) {
        if(!this._listeners[key]) this._listeners[key] = [];

        const wrapped = (...args) => {
            // Invoke the original callback
            fn(...args);
            // Remove the wrapped function from the array
            const index = this._listeners[key].indexOf(wrapped);
            if (index > -1) {
                this._listeners[key].splice(index, 1);
            }
        };

        this._listeners[key].push(wrapped);
        return wrapped;
    }
    
    async listenForBodyKey(key){
        return new Promise( res => {
            this._registeredKeys.push(key);
            this.addListener(key, (responseObj) => res(responseObj));
        });
    }

    foundKey(key, obj){
        if(!this._listeners[key]) return;
        for( let listener of this._listeners[key] ){
            listener(obj);
        }
    }

    getKeys(){
        return this._registeredKeys
    }
}
export default NetworkRequests;