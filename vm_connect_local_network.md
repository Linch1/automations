Passaggi in VirtualBox:
Spegni la VM.

Vai alle Impostazioni → Rete → Scheda 1.

Cambia la modalità di rete da "NAT" a "Scheda con bridge".

Seleziona la scheda di rete fisica del tuo PC.

Avvia la VM e ottieni l'IP della VM con:

bash
ip a  # (Linux)
ipconfig  # (Windows)

Ora, dalla VM, puoi accedere al server del tuo PC utilizzando l'IP locale del PC (lo trovi con ipconfig su Windows o ifconfig su Linux/macOS).

Esempio:
Se il tuo PC ha IP 192.168.1.100, accedi al server con:

bash
curl http://192.168.1.100:PORTA