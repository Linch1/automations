import Paths from "../lib/Paths.js";
import fs from "fs";
import path from "path";


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
            const content = await fs.promises.readFile(downloadsFile, 'utf-8');
            let posts = {};

            let filteredPosts = Object.values(JSON.parse(content))

            for( let post of filteredPosts ){
                console.log(post)
                if(post.username != user) {
                    console.log("Found different", user, post.username);
                    process.exit(0);
                }
            }
        } catch (err) {
            console.error(`Failed to read or parse ${downloadsFile}:`, err);
        }
    }
}