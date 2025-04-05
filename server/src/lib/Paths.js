import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default new class {

    DOWNLOADS_DIR = path.join(__dirname, '../../downloads');
    DATA_DIR = path.join(__dirname, '../../data');
    PROFILES_DIR = path.join(this.DATA_DIR, 'profiles');
    SCHEDULE_PATH = path.join(this.DATA_DIR, 'schedules'); // weekly scaping schedule
    MASTER_CONFIG_PATH = path.join(this.DATA_DIR, 'master.json'); // the master profiles config
    TRACKING_PATH = path.join(this.DATA_DIR, 'tracking.json'); // traks how many time a profile has been scraped

    CAPTIONS_PDF_TO_TRANSLATE = path.join(this.DATA_DIR, 'captions/translate_me.pdf');
    CAPTIONS_PDF_TRANSLATED = path.join(this.DATA_DIR, 'captions/translated.pdf');
    CAPTIONS_OUT_PATH = path.join(this.DATA_DIR, 'captions/out.json'); 
    CAPTIONS_IN_PATH = path.join(this.DATA_DIR, 'captions/in.json'); 

    getDownloadJsonPath(platform, username){
        let filepath = path.join(this.DOWNLOADS_DIR, platform, username, "downloads.json");
        if(!fs.existsSync(path.dirname(filepath)))fs.mkdirSync(path.dirname(filepath), {recursive:true});
        return filepath;
    }
    getPlatformScrapingSchedulePath(platform){
        let filepath = path.join(this.SCHEDULE_PATH, "scraping", platform+".json");
        if(!fs.existsSync(path.dirname(filepath)))fs.mkdirSync(path.dirname(filepath), {recursive:true});
        return filepath;
    }
    getPlatformUploadsPaths(platform){
        let filepath = path.join(this.DATA_DIR, "uploads", platform+".json");
        if(!fs.existsSync(path.dirname(filepath))) {
            fs.mkdirSync(path.dirname(filepath), {recursive:true});
            fs.writeFileSync(filepath, "{}");
        }
        return filepath;
    }
    getPlatformPostSchedulePath(platform){
        let filepath = path.join(this.SCHEDULE_PATH, "post", platform+".json");
        if(!fs.existsSync(path.dirname(filepath)))fs.mkdirSync(path.dirname(filepath), {recursive:true});
        return filepath;
    }
    getDownloadPath(platform, username, id, type){
        let ext = type=="video"?"mp4":"jpg";
        let filepath = path.join(this.DOWNLOADS_DIR, platform, username, type, id+"."+ext);
        if(!fs.existsSync(path.dirname(filepath)))fs.mkdirSync(path.dirname(filepath), {recursive:true});
        return filepath;
    }
    getPostMediaUrl(platform, username, id, type){
        let ext = type=="video"?"mp4":"jpg";
        return process.env.MEDIA_SERVER + `/${platform}/${username}/${type}/${id+"."+ext}`;
    }
}