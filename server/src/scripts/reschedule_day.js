import Utils from "../../../shared/Utils.js";
import Paths from "../lib/Paths.js";
import { generateDaySchedule } from "../lib/schedule_functions.js";
import fs from "fs";

const day = process.argv[2]; // il primo argomento dopo `node script.js`
const platform = process.argv[3];
const profile = process.argv[4]
if (!day || !platform) {
  console.error("Errore: specifica un giorno della settimana (es. 'monday') e una paltform (ex: instagram)");
  process.exit(1);
}


let schedule = JSON.parse(fs.readFileSync(Paths.getPlatformScrapingSchedulePath(platform), "utf-8"));
if(!schedule[profile].days[day]) {
  console.error(`Errore: the give day ${day} is missing in the schedule. you cannot reschedule a missing day`);
  process.exit(1);
}

let dayStart = Utils.getNextDayTimestamp(day);
let nextDayStart = dayStart + 60 * 60 * 24;

//let oldValues = [...Object.values(schedule[profile].days[day])]
generateDaySchedule(schedule, day, dayStart, nextDayStart, {[profile]: Object.values(schedule[profile].days[day])} );
//let newValues = [...Object.values(schedule[profile].days[day])];
//console.log("same length: ", oldValues.length == newValues.length )
//console.log("all users: ", oldValues.filter( v => !newValues.includes(v)).length == 0 );
