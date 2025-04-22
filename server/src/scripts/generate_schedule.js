import Utils from "../../../shared/Utils.js";
import Paths from "../lib/Paths.js";
import { enrichTrackingWithNewUsers, generateSchedule } from "../lib/schedule_functions.js";
import fs from "fs";

while(true){
    let now = Utils.nowInSecs()
    let general =  JSON.parse(fs.readFileSync(Paths.getScheduleGeneralPath(), "utf-8"));
    if(!general.regenerateAt || now > general.regenerateAt){
        enrichTrackingWithNewUsers();
        generateSchedule();
        console.log(Utils.nowInSecs() + ' ✅ weekly.json generato con successo.');
    }
    await Utils.sleep(10 * 60 * 1000);
}

