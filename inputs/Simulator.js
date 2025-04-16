const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

const Simulator = new (class {
  /**
   * Apre Nautilus sul file e simula un drag and drop con xdotool.
   * @param {string} filePath - Percorso assoluto del file da selezionare in Nautilus
   * @param {number} dragEndX - Posizione finale X del trascinamento
   * @param {number} dragEndY - Posizione finale Y del trascinamento
   */
  async fileDrag(filePath, dragEndX, dragEndY) {

    if (!path.isAbsolute(filePath)) {
      console.error("Il percorso del file deve essere assoluto.");
      return;
    }

    let tmpDir = "/tmp/input/dragdrop";
    let tmpPath = path.join(tmpDir, path.basename(filePath))
    try {

      if(fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true }); // clear the driectory from old files
      fs.mkdirSync(tmpDir, {recursive:true}); 

      fs.copyFileSync(filePath, );

      // open nautils and get pid
      const nautilus = spawn("nautilus", ["--select", tmpPath], {
        detached: true,
        stdio: "ignore"
      });

      const nautilusPid = nautilus.pid;
      console.log("Nautilus PID:", nautilusPid);

      await sleep(2000); // aspetta che si apra la finestra

      // 🔍 Trova la finestra
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

      // 📦 Coordinate drag
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

      // 🛑 Uccidi SOLO il processo Nautilus che hai avviato
      process.kill(nautilusPid, "SIGTERM");
      console.log("Nautilus terminato (PID:", nautilusPid, ")");

    } catch (error) {
      console.error("Errore durante l'interazione:", error);
    } finally {
      /* avoid removing it instantly, otherwise the upload may fail
      if(tmpPath){
        if(fs.existsSync(tmpPath)) fs.rmSync(tmpPath)
      }
      */
    }
  }
})();

module.exports = Simulator;
