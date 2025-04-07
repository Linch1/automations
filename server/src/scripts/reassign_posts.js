import Paths from "../lib/Paths.js";
import fs from "fs";
import path from "path";

async function moveFilesAndRemoveDir(dir1, dir2) {
    const subfolders = ['video', 'image'];

    for (const subfolder of subfolders) {
        const srcFolder = path.join(dir1, subfolder);
        const destFolder = path.join(dir2, subfolder);

        try {
            const files = fs.readdirSync(srcFolder);

            for (const file of files) {
                const srcPath = path.join(srcFolder, file);
                const destPath = path.join(destFolder, file);
                try {
                    // Controlla se il file esiste già nella destinazione
                    fs.accessSync(destPath);
                    console.log(`⚠️  File già esistente, salto: ${file}`);
                } catch {
                    // Se non esiste, sposta il file
                    console.log(`[moving] ${srcPath} -> ${destPath}`);
                    fs.renameSync(srcPath, destPath);
                }
            }
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.error(`Errore con ${srcFolder}:`, err);
            }
        }
    }

    // Rimuovi dir1
    fs.rmSync(dir1, { recursive: true, force: true });
}

async function moveFiles( platform, fromUser, toUser ){
    const fromUserDownloads = path.join( Paths.DOWNLOADS_DIR, platform, fromUser);
    const toUserDownlaods = path.join( Paths.DOWNLOADS_DIR, platform, toUser);
    if(!fs.existsSync(fromUserDownloads)) return;
    await moveFilesAndRemoveDir(fromUserDownloads, toUserDownlaods);
}

const result = {};
const platforms = await fs.promises.readdir(Paths.DOWNLOADS_DIR);
for (const platform of platforms) {
    const platformPath = path.join( Paths.DOWNLOADS_DIR, platform);
    const stat = await fs.promises.stat(platformPath);
    if (!stat.isDirectory()) continue;

    result[platform] = {};

    const users = await fs.promises.readdir(platformPath);
    for (const user of users) {
        const userPath = path.join(platformPath, user);
        const userStat = await fs.promises.stat(userPath);
        if (!userStat.isDirectory()) continue;

        const downloadsFile = path.join(userPath, 'downloads.json');
        if (!fs.existsSync(downloadsFile)) continue;

        try {

            const content = JSON.parse(fs.readFileSync(downloadsFile, 'utf-8'));
            let posts = Object.values(content);
            for( let post of posts ){
                if(post.username != user) {
                    console.log(`[diff] real_user: ${user} -> post user: ${post.username}`);
                    await moveFiles(post.username, user);
                    post.username = user;
                }
            }
            fs.writeFileSync(downloadsFile, JSON.stringify(content))

        } catch (err) {
            console.error(`Failed to read or parse ${downloadsFile}:`, err);
        }
    }
}