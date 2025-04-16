const { exec, execSync } = require("child_process");
const path = require("path");

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

const Simulator = new (class {
  /**
   * Apre Nautilus sul file e simula un drag and drop con xdotool.
   * @param {string} filePath - Percorso assoluto del file da selezionare in Nautilus
   */
  async fileDrag(filePath, dragEndX, dragEndY) {
    if (!path.isAbsolute(filePath)) {
      console.error("Il percorso del file deve essere assoluto.");
      return;
    }

    try {
      // Apri Nautilus 
      await new Promise((resolve, reject) => {
        exec(`nautilus --select "${filePath}" &`, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      console.log("Nautilus aperto")

      // Attendi che la finestra si apra
      await sleep(2000);

      // Ottieni ID finestra
      const winId = execSync(`xdotool search --onlyvisible --class "Nautilus" | tail -1`)
        .toString()
        .trim();

      if (!winId) {
        console.error("Finestra Nautilus non trovata.");
        return;
      }

      console.log("moving window to x:0 y:0");
      execSync(`xdotool windowmove ${winId} 0 0`);
      await sleep(1000);

      // Coordinate
      const startX = 280,
        startY = 154;
      const endX = dragEndX,
        endY = dragEndY;
      const steps = 50;
      const interval = 10;

      const deltaX = (endX - startX) / steps;
      const deltaY = (endY - startY) / steps;

      execSync(`xdotool mousemove ${startX} ${startY}`);
      execSync(`xdotool mousedown 1`);

      for (let i = 0; i <= steps; i++) {
        const curX = Math.round(startX + deltaX * i);
        const curY = Math.round(startY + deltaY * i);
        execSync(`xdotool mousemove ${curX} ${curY}`);
        await sleep(interval);
      }

      execSync(`xdotool mouseup 1`);
      execSync(`xdotool windowkill ${winId}`);
    } catch (error) {
      console.error("Errore durante l'interazione con Nautilus o xdotool:", error);
    }
  }
})();

module.exports = Simulator;
