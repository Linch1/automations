const { execSync } = require("child_process");
const path = require("path");

try {
  // Entra nella cartella 'server'
  const serverPath = path.join(__dirname, "server");
  process.chdir(serverPath);
  console.log(`📂 Entrato nella cartella: ${serverPath}`);

  // Esegui pm2 start src/index.js
  console.log("▶️ Avvio di src/index.js con PM2...");
  execSync("pm2 start src/index.js", { stdio: "inherit" });

  // Esegui pm2 start src/scripts/generate_schedule.js
  console.log("▶️ Avvio di src/scripts/generate_schedule.js con PM2...");
  execSync("pm2 start src/scripts/generate_schedule.js", { stdio: "inherit" });

  // Torna indietro e entra nella cartella 'backoffice'
  const backofficePath = path.join(__dirname, "backoffice");
  process.chdir(backofficePath);
  console.log(`📂 Entrato nella cartella: ${backofficePath}`);

  // Esegui pm2 start start-script.js
  console.log("▶️ Avvio di start-script.js con PM2...");
  execSync("pm2 start start-script.js", { stdio: "inherit" });

  console.log("✅ Tutti i processi sono stati avviati con successo!");
} catch (error) {
  console.error("❌ Si è verificato un errore:", error.message);
}