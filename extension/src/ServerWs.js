import Utils from "./utils/Utils.js";


class ServerWs {
    BASE_URL = 'ws://localhost:5010';
    MAX_RETRIES = 5; // Numero massimo di tentativi di riconnessione
    RECONNECT_DELAY = 1000; // Tempo iniziale di attesa prima di riconnettersi (1s)

    constructor() {
        this._listeners = {};
        this.retries = 0;
        this.connect();
    }

    connect() {
        console.log(`Connecting to WebSocket at ${this.BASE_URL}...`);
        this.ws = new WebSocket(this.BASE_URL);

        this.ws.onopen = () => {
            console.log(`WebSocket connected.`);
            this.open = true;
            this.retries = 0; // Reset dei tentativi in caso di successo

            console.log("Setting listeners");
            this.setupListeners();

            // Ping per mantenere la connessione attiva
            this.pingInterval = setInterval(() => this.emit("ping"), 30000);
        };

        this.ws.onclose = () => {
            console.warn(`WebSocket disconnected.`);
            clearInterval(this.pingInterval);
            this.retryConnection();
        };

        this.ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            this.ws.close(); // Chiude la connessione per evitare problemi
        };
    }

    async waitForOpen(){
        while(!this.open) await Utils.sleep(100);
    }

    retryConnection() {
        if (this.retries < this.MAX_RETRIES) {
            const delay = this.RECONNECT_DELAY * (2 ** this.retries); // Backoff esponenziale
            console.log(`Retrying connection in ${delay / 1000} seconds...`);

            setTimeout(() => {
                this.retries++;
                this.connect();
            }, delay);
        } else {
            console.error(`Max retries reached. Could not reconnect.`);
        }
    }

    setupListeners() {
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data.toString());
            console.log("Recived message: ", data)
            this._dispatch(data);
        };
    }

    emit(type, payload) {
        console.log("Emitting server: ", this.ws.readyState)
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, payload }));
        } else {
            console.warn("WebSocket is not open. Message not sent:", type);
        }
    }

    on(type, listener) {
        if (!this._listeners[type]) this._listeners[type] = [];
        this._listeners[type].push(listener);
    }

    once(type, listener) {
        let self = this;
        if (!this._listeners[type]) this._listeners[type] = [];
        function wrapper(...args) {
            self._listeners[type] = self._listeners[type].filter(l => l !== wrapper);
            listener(...args);
        }
        this._listeners[type].push(wrapper);
    }

    send(type, payload = {}) {
        return new Promise(res => {
            this.once(type + "Response", (data) => res(data));
            this.emit(type, payload);
        });
    }

    _dispatch(data) {
        if (this._listeners[data.type]) {
            for (let listener of this._listeners[data.type]) {
                listener(data.payload);
            }
        }
    }

    close() {
        clearInterval(this.pingInterval);
        this.ws.close();
    }
}

export default new ServerWs();
