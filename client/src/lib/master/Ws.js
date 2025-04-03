import WebSocket from 'ws';
import fs from 'fs';
import Paths from '../Paths.js';
import MessagesHandler from './MessagesHandler.js';
import MessageType from '../../../../shared/MessageType.js';
import Utils from '../../../../shared/Utils.js';

const SERVER_URL = 'ws://10.0.2.2:6000';
const RECONNECT_DELAY = 3000; // in ms

export default new class {
    
    run(){
        console.log('🔌 Connecting to master server...');
        let ws = Utils.rewrapSocket(new WebSocket(SERVER_URL));
        this.ws = ws;
      
        ws.on('open', () => {
          console.log('✅ Connected to master server');
          this.open = true;
          try {
            const config = JSON.parse(fs.readFileSync(Paths.CONFIG_PATH));
            ws.send({ type: MessageType.CONFIG, payload: config });
          } catch (err) {
            console.error('❌ Failed to read config:', err.message);
          }
        });
      
        ws.on('message', MessagesHandler.handle.bind(MessagesHandler));
      
        ws.on('error', (err) => {
          console.error('⚠️ WebSocket error:', err.message);
        });
      
        ws.on('close', (code, reason) => {
          console.warn(`🔌 Connection closed [${code}] - ${reason}`);
          console.log(`🔁 Reconnecting in ${RECONNECT_DELAY / 1000}s...`);
          setTimeout(this.run.bind(this), RECONNECT_DELAY);
        });
    }

    send(obj){
        this.ws.send(obj);
    }
    on(event, callback){
        this.ws.on(event, callback);
    }
    async waitForOpen(){
      console.log("wait for open invoked")
      while(!this.open) {
        await Utils.sleep(100);
        console.log("sleeping")
      }
    }
}

