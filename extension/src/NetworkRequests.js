
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
    
    async listenForBodyKey(key, timeout=30_000){
        return new Promise( (res,rej) => {
            this._registeredKeys.push(key);
            this.addListener(key, (responseObj) => res(responseObj));
            console.log("Starting timeout of 30 seconds");
            setTimeout(() => { // timeout
                console.log("Timeout has passed of 30 seconds")
                this.foundKey(key, null);
            }, timeout);
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