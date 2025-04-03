// test-client.js
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:5010'); // cambia con il tuo indirizzo

ws.on('open', () => {
  console.log('✅ Connessione aperta!');
  ws.send('Hello from client!');
});

ws.on('message', (data) => {
  console.log('📩 Messaggio ricevuto dal server:', data.toString());
});

ws.on('close', () => {
  console.log('❌ Connessione chiusa');
});

ws.on('error', (err) => {
  console.error('⚠️ Errore WebSocket:', err.message);
});
