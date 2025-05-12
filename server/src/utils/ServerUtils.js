import fs from 'fs';
import path from "path";
import Paths from '../lib/Paths.js';
import Utils from '../../../shared/Utils.js';
import http from "http";
import https from "https";
import Ws from '../lib/Ws.js';
import MessageType from '../../../shared/MessageType.js';

export default new class {

    getUsersToScrapeSinceLast(platform) {
        const data = JSON.parse(fs.readFileSync(Paths.getPlatformScrapingSchedulePath(platform)));
        const now = Utils.nowInSecs();
        const result = {};
        for( let profile in data ){
            result[profile]
            let {days, timestamps, lastScraped} = data[profile];
            lastScraped = lastScraped || 0;
            result[profile] = Object.keys(timestamps)
                .map( ts => parseInt(ts) )
                .filter( ts => ts > lastScraped && ts < now )
                .map( ts => timestamps[ts] );
        }
        return result;
    }

    getPlatformUrl(platform){
        return {
            "instagram": "https://www.instagram.com"
        }[platform]
    }

    addUploadedPostToUser(platform, user, postId){
        let filePath = Paths.getPlatformUploadsPaths(platform);
        let obj = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if(!obj[user]) obj[user] = {};
        obj[user][postId] = Utils.nowInSecs();
        fs.writeFileSync(filePath, JSON.stringify(obj));
    }  
    
    wasAlreadyUploaded(platform, user, postId){
        let filePath = Paths.getPlatformUploadsPaths(platform);
        let obj = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        return obj[user]?.[postId]
    }

    getNextUserToScrape(platform, profile){
        return this.getUsersToScrapeSinceLast(platform)[profile][0];
    }

    updateScheduleLastScrapedTimestamp(platform, profile){
        let filepath = Paths.getPlatformScrapingSchedulePath(platform);
        let json = JSON.parse(fs.readFileSync(filepath))
        json[profile].lastScraped = Utils.nowInSecs();
        fs.writeFileSync(filepath, JSON.stringify(json, null, 2));
    }

    async checkUsersToScrape(){
        while(true){
            
            const master = JSON.parse(fs.readFileSync(Paths.MASTER_CONFIG_PATH));
            for (const [platform, config] of Object.entries(master)) {
                let toScrape = this.getUsersToScrapeSinceLast(platform);
                console.log(`[check_scraping] platform=${platform} toScrape=${JSON.stringify(toScrape)}`);

                for( let profile in toScrape ){
                    let socket = Ws.connections.get(profile);
                    if(!socket) {
                        console.log(`[check_scraping] missing socket for profile=${profile} it is required to do scraping on any profile.`)
                        continue;
                    }

                    for( let username of toScrape[profile] ){
                        console.log(`[scrape] sent open browser command on platform=${platform} profile=${profile} username=${username}`);
                        socket.send({
                            type: MessageType.OPEN_BROWSER, 
                            payload: { 
                                platform, profile, username, 
                                feedUrl: `https://instagram.com/${username}`, 
                                reelsUrl: `https://instagram.com/${username}/reels/`
                            }});
                        break;
                    }

                    this.updateScheduleLastScrapedTimestamp(platform, profile);
                }
                
            }
            
            await Utils.sleep( 60 * 15 * 1000 ); //15 minutes
        }
        
    }

    getPostMainInformations(item){
        if(item.already_formatted) return item;
        let videoVersions = item.video_versions;
        let caption = item.caption.text;
        let username = item.user.username;
        let pk = item.user.pk;
        let duration = item.video_duration;
        let likes = item.like_count;
        let comments = item.comment_count;
        let views = item.play_count;
        let imageVersions = item.image_versions2;
        return {already_formatted: true, videoVersions, imageVersions, caption, username, id: item.id, pk, duration, likes, comments, views, performance: likes/views}
    }

    download(filepath, url) {
        return new Promise( (res,rej) => {
            const protocol = url.startsWith('https') ? https : http;
            //if(!fs.existsSync(path)) fs.writeFileSync(path, null);
            const file = fs.createWriteStream(filepath);

            const request = protocol.get(url, function(response) {
                response.pipe(file);
                file.on('finish', function() {
                    file.close(() => {
                        res()
                    });
                });
            });
        
            request.on('error', function(err) {
                fs.unlink(filepath, () => {}); // Cancella il file in caso di errore
                console.error('Errore nel download:', err.message);
                rej()
            });
        });
    }

    addUserFeedToDownloadJson(platform, feed){
        let username = feed[Object.keys(feed)[0]].username;
        let jsonPath = Paths.getDownloadJsonPath(platform, username);
        let data;
        if(fs.existsSync(jsonPath)){
            data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
        }
        for( let postId in feed ){
            if( data[postId] ) {
                console.log("Removing from feed already downloaded post=", postId);
                delete feed[postId];
            }
        }
        console.log(`[adding] ${Object.keys(feed).length} posts for user=${username}`);
        data = {...feed, ...data};
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    }

    getDownloadsJson({platform, username, postId}){
        const filePath = Paths.getDownloadJsonPath(platform, username);
        return JSON.parse(fs.readFileSync(filePath, "utf-8")) 
    }
    getPostInformations({platform, username, postId}) {
        const filePath = Paths.getDownloadJsonPath(platform, username);
        return JSON.parse(fs.readFileSync(filePath, "utf-8"))[postId]
    }

    markPostAsSwiped({platform, username, postId, direction}){
        const filePath = Paths.getDownloadJsonPath(platform, username);
        const posts = JSON.parse(fs.readFileSync(filePath, "utf-8")) ;
        posts[postId].swipe = direction;
        fs.writeFileSync(filePath, JSON.stringify(posts))
    }

    async findProfileThatManageUsername(username){
        const categories = await fs.promises.readdir(Paths.PROFILES_DIR);
        for( let category of categories ){
            const categoryPath = path.join(Paths.PROFILES_DIR, category);
            const content = await fs.promises.readFile(categoryPath, 'utf-8');
            const categoryInfo = JSON.parse(content);
            for( let platform in categoryInfo.accounts ){
                if(categoryInfo.accounts[platform].users.includes(username)) return {...categoryInfo, profilePath: categoryPath};
            }
        }
    }

    async removeUsernameFromHisProfile(username){
        let profile = await this.findProfileThatManageUsername(username);
        let index = profile.accounts.indexOf(username);
        if (index !== -1) {
            console.log("[warn] not found username while removing it")
            profile.accounts.splice(index, 1);
        }
        fs.writeFileSync(profile.profilePath, JSON.stringify(profile, "", 2));
    }

    async traverseDownloads( liked=false, uploaded=false ) {
        
        const usersCategories = {};
        const categoriesDict = {};
        const platformsDict = {};
        const categories = await fs.promises.readdir(Paths.PROFILES_DIR);
        for( let category of categories ){
            const categoryPath = path.join(Paths.PROFILES_DIR, category);
            const content = await fs.promises.readFile(categoryPath, 'utf-8');
            const categoryInfo = JSON.parse(content);
            for( let platform in categoryInfo.accounts ){
                platformsDict[platform] = true;
                for( let user of categoryInfo.accounts[platform].users ){
                    if(!usersCategories[platform]) usersCategories[platform] = {};
                    let categoryName = category.replace(".json", "");
                    usersCategories[platform][user] = categoryName;
                    categoriesDict[categoryName] = true;
                }
            }
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
                    const content = await fs.promises.readFile(downloadsFile, 'utf-8');
                    let posts = {};

                    let filteredPosts = Object.values(JSON.parse(content))

                    if(!liked) filteredPosts = filteredPosts.filter(p => !p.swipe);
                    else filteredPosts = filteredPosts.filter(p => p.swipe == "right");

                    if(!uploaded) filteredPosts = filteredPosts.filter(p => !this.wasAlreadyUploaded(platform, user, p.id));

                    for( let post of filteredPosts ){
                        if(post.videoVersions) {
                            post.video = `/${platform}/${user}/video/${post.id}.mp4`;
                            delete post.videoVersions
                        }
                        if(post.imageVersions) {
                            post.image = `/${platform}/${user}/image/${post.id}.jpg`;
                            delete post.imageVersions;
                        }
                        post.uploadedTs = this.wasAlreadyUploaded(platform, user, post.id);
                        post.category = usersCategories[platform][user];
                        posts[post.id] = post;
                    }

                    result[platform][user] = posts;
                } catch (err) {
                    console.error(`Failed to read or parse ${downloadsFile}:`, err);
                }
            }
        }

        return {
            users: result,
            platforms: Object.keys(platformsDict),
            categories: Object.keys(categoriesDict)
        };
    }

    async addTranslatedCaptions(captions){
        let lang = captions.lang;
        for( let platform in captions ){
            if(platform == "lang") continue;
            for( let user in captions[platform] ){
                let filePath = Paths.getDownloadJsonPath(platform, user);
                let posts = JSON.parse(fs.readFileSync(filePath, "utf-8"))
                for( let postId in captions[platform][user] ){
                    let translatedCaption = captions[platform][user][postId];
                    if(!posts[postId].caption_tanslation) posts[postId].caption_tanslation = {};
                    posts[postId].caption_tanslation[lang] = translatedCaption;
                }
                console.log(JSON.stringify(posts, null, 2))
                process.exit();
                fs.writeFileSync(filePath, JSON.stringify(posts))
            }
        }
    }

    async getAllLikedCaptionsNotTranslated(){
        let captions = {};
        const platforms = await fs.promises.readdir(Paths.DOWNLOADS_DIR);
        for (const platform of platforms) {
            const platformPath = path.join( Paths.DOWNLOADS_DIR, platform);
            const stat = await fs.promises.stat(platformPath);
            if (!stat.isDirectory()) continue;

            captions[platform] = {};
            const users = await fs.promises.readdir(platformPath);
            for (const user of users) {
                const userPath = path.join(platformPath, user);
                const userStat = await fs.promises.stat(userPath);
                if (!userStat.isDirectory()) continue;
                captions[platform][user] = {};

                const downloadsFile = path.join(userPath, 'downloads.json');
                if (!fs.existsSync(downloadsFile)) continue;

                try {
                    const content = await fs.promises.readFile(downloadsFile, 'utf-8');
                    let likedPosts = Object.values(JSON.parse(content)).filter(p => p.swipe == "right");
                    for( let post of likedPosts ){
                        captions[platform][user][post.id] = post.caption;
                    }
                } catch (err) {
                    console.error(`Failed to read or parse ${downloadsFile}:`, err);
                }
            }
        }

        let filePath = Paths.CAPTIONS_OUT_PATH;
        fs.writeFileSync(filePath, JSON.stringify(captions, null, 2));
        return filePath;
    }
    
}