const { exec, execSync } = require("child_process");
const path  = require("path");

function sleep(ms){
  return new Promise( (res) => {
    setTimeout( res, ms );
  })
}
const Simulator = new class {
    /**
     * Apre Nautilus sul file e simula un drag and drop con xdotool.
     * @param {string} filePath - Percorso assoluto del file da selezionare in Nautilus
     * // simulateFileDrag("/home/tuoutente/Downloads/test.txt");
     */
    fileDrag(filePath, dragEndX, dragEndY) {
      if (!path.isAbsolute(filePath)) {
        console.error("Il percorso del file deve essere assoluto.");
        return;
      }
    
      // Apri Nautilus con il file selezionato
      exec(`nautilus --select "${filePath}" &`, async (err) => {
        if (err) {
          console.error("Errore nell'aprire Nautilus:", err);
          return;
        }
    
        // Attendi che la finestra si apra
        await sleep(2000);
        try {
        // Ottieni l'ID finestra Nautilus
        const winId = execSync(`xdotool search --onlyvisible --class "Nautilus" | tail -1`).toString().trim();
        if (!winId) {
            console.error("Finestra Nautilus non trovata.");
            return;
        }

        console.log("moving window to x:0 y:0")
        // Sposta la finestra
        execSync(`xdotool windowmove ${winId} 0 0`);

        await sleep(2000);

        // Coordinate iniziali e finali
        const startX = 280, startY = 154;
        const endX = dragEndX, endY = dragEndY;
        const steps = 50;
        const interval = 10; // in ms

        const deltaX = (endX - startX) / steps;
        const deltaY = (endY - startY) / steps;

        execSync(`xdotool mousemove ${startX} ${startY}`);
        execSync(`xdotool mousedown 1`);

        let i = 0;
        const moveStep = () => {
            if (i > steps) {
            execSync(`xdotool mouseup 1`);
            execSync(`xdotool windowkill ${winId}`);
            return;
            }

            const curX = Math.round(startX + deltaX * i);
            const curY = Math.round(startY + deltaY * i);
            execSync(`xdotool mousemove ${curX} ${curY}`);
            i++;
            setTimeout(moveStep, interval);
        };

        moveStep();



        } catch (error) {
        console.error("Errore durante l'interazione con xdotool:", error);
        }

      });
    }
    
    
    
} 
module.exports = Simulator;