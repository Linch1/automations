import fs from 'fs';
import path from 'path';
import Paths from '../lib/Paths.js';
import Utils from '../../../shared/Utils.js';

const master = JSON.parse(fs.readFileSync(Paths.MASTER_CONFIG_PATH));
const tracking = fs.existsSync(Paths.TRACKING_PATH) ? JSON.parse(fs.readFileSync(Paths.TRACKING_PATH)) : {};
const allProfiles = fs.readdirSync(Paths.PROFILES_DIR).map(file => JSON.parse(fs.readFileSync(path.join(Paths.PROFILES_DIR, file))));
const secondsInDay = 86400;

function organizeTrackingByScrapedTimestamp(){
  let organized = {}; /* {instagram: {[ts1]: [user1, user2], [ts2]: [user3], ..}, tiktok: {...}} */
  for( let platform in tracking ){
    for( let user in tracking[platform] ){
      let scrapedTime = tracking[platform][user].lastScrapedTs;
      if(!organized[platform]) organized[platform] = {};
      if(!organized[platform][scrapedTime]) organized[platform][scrapedTime] = [];
      organized[platform][scrapedTime].push(user);
    }
  }
  return organized;
}
function getLessScrapedProfile(platform){
  let organizedTracking = organizeTrackingByScrapedTimestamp(); /* {instagram: {[ts1]: [user1, user2], [ts2]: [user3], ..}, tiktok: {...}} */
  let scrapedTimestamps = Object.keys(organizedTracking[platform]).map( k => parseInt(k)).sort((a,b)=>a-b);
  let user = Utils.getRandomFromArray(organizedTracking[platform][scrapedTimestamps[0]]);
  return user;
}
function getProfileToScrape(platform, nowInSecs){
  //conditions: must be one of the currently scraped long time ago, must be scraped at least {master.daysIntervalForScrapingAgainSameUser} days ago
  let organizedTracking = organizeTrackingByScrapedTimestamp(); /* {instagram: {[ts1]: [user1, user2], [ts2]: [user3], ..}, tiktok: {...}} */
  let scrapedTimestampsOrdered = Object.keys(organizedTracking[platform]).map( k => parseInt(k)).sort((a,b)=>a-b);
  for(let ts of scrapedTimestampsOrdered){
    for(let user of organizedTracking[platform][ts]){
      let canScrapeAgainAtTs = tracking[platform][user].lastScrapedTs + (master[platform].daysIntervalForScrapingAgainSameUser * secondsInDay);
      if(nowInSecs > canScrapeAgainAtTs) return user;
    }
  }
}
function getUsersPoolsByPlatform(){
  let usersPools = {};
  for( let pofileInfos of allProfiles ){
    for( let platform in pofileInfos.accounts ){
      if(!usersPools[platform]) usersPools[platform] = [];
      usersPools[platform].push(...pofileInfos.accounts[platform].users)
    }
  }
  return usersPools;
}
export function enrichTrackingWithNewUsers(){
  let usersPools = getUsersPoolsByPlatform();
  for(let platform in usersPools){
    for(let user of usersPools[platform]){
      if(!tracking[platform]) tracking[platform] = {};
      if(typeof(tracking[platform][user]) == "undefined"){
        tracking[platform][user] = {lastScrapedTs: 0};
      }
    }
  }
}


///---------------------
// Parse HH:mm string to milliseconds since midnight
function parseTimeToSeconds(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60 + minutes) * 60;
}

// Parse duration string like "30m", "1h" to milliseconds
function parsePauseRandomFactorToSeconds(durationStr) {
  if (durationStr.endsWith('m')) {
    return parseInt(durationStr.replace("m", "")) * 60;
  } else if (durationStr.endsWith('h')) {
    return parseInt(durationStr.replace("h", "")) * 60 * 60;
  }
  return 0;
}

// Function to apply random factor to pause times and return timestamp ranges
function generatePauseTimestamps(config, startOfDay) {
  const factorMs = parsePauseRandomFactorToSeconds(config.pause_random_factor);
  return [...config.pause].map(pauseEntry => {
    const [startStr, endStr] = pauseEntry.time.split('-');
    let startMs = parseTimeToSeconds(startStr);
    let endMs = parseTimeToSeconds(endStr);

    const startOffset = Math.floor(Math.random() * factorMs);
    const endOffset = Math.floor(Math.random() * factorMs);

    startMs = Math.max(0, startMs + (Math.random() < 0.5 ? -startOffset : startOffset));
    endMs = Math.max(startMs, endMs + (Math.random() < 0.5 ? -endOffset : endOffset));

    return [startOfDay + startMs, startOfDay + endMs];
  });
}
///---------------------


function getRandomDuration() {
  // Between 30 minutes (1800000 ms) and 1 hour (3600000 ms)
  return 1800 + Math.floor(Math.random() * 1800);
}
function isTimeAvailable(timestamp, busySlots) {
  return !busySlots.some(([start, end]) => timestamp >= start && timestamp < end);
}
function getNextAvailableTime(startTime, busySlots, dayEnd) {
  let currentTime = startTime;
  let interval = 15 * 60;
  while (
    currentTime + interval <= dayEnd &&
    !isTimeAvailable(currentTime, busySlots)
  ) {
    currentTime += 15 * 60;
  }
  return currentTime <= dayEnd ? currentTime : null;
}


export function generateDaySchedule(schedule, day, dayStart, nextDayStart, usersToScrape){

  for (const [platform, config] of Object.entries(master)) {

    const { profiles: platformProfiles, dailyUsersScrapingLimit } = config;

    for( let profile in platformProfiles ){
      if(usersToScrape && !usersToScrape[profile])continue;

      if(schedule[profile]){ // clear schedule for the day that has to be scheduled
        schedule[profile].days[day] = {};
        for( let ts in schedule[profile].timestamps){
          if( ts > dayStart && ts < nextDayStart ) delete schedule[profile].timestamps[ts];
        }
      }

      if(!schedule[profile]) schedule[profile] = { days: {}, timestamps: {} };
      if(!schedule[profile].days[day]) schedule[profile].days[day] = {};

      let currentTime = dayStart;
      let pauseTimestamps = generatePauseTimestamps( platformProfiles[profile], dayStart );
      let alreadyScraped = [];
      
      for( let i = 0; i < dailyUsersScrapingLimit; i ++){
        currentTime = getNextAvailableTime(currentTime, pauseTimestamps, nextDayStart);
        if (!currentTime) {
          console.warn(`Nessuno slot disponibile per profile=${profile} su ${day}.`);
          break;    
        }

        let userToScrape = usersToScrape ? usersToScrape[profile].shift() : getProfileToScrape(platform, currentTime);
        if(!userToScrape || alreadyScraped.includes(userToScrape)) break; // avoid scraping the same user twice the same day

        alreadyScraped.push(userToScrape);
        tracking[platform][userToScrape].count = (tracking[platform][userToScrape].count || 0) + 1;
        tracking[platform][userToScrape].lastScrapedTs = currentTime;

        
        schedule[profile].days[day][Utils.formatTimestampToTime(currentTime)] = userToScrape;
        schedule[profile].timestamps[currentTime] = userToScrape;
        // Add cooldown time for next task
        let sleep = getRandomDuration();
        currentTime += sleep;
      }

    }

    fs.writeFileSync(Paths.getPlatformScrapingSchedulePath(platform), JSON.stringify(schedule, null, 2));
  }

}
export function generateSchedule() {
  const schedule = {};
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = now.getDay();

  // Filter the tasks to the days from now until end of week
  const weekDaysToSchedule = days.slice(currentDay).filter(d => d !== 'sunday');
  
  for( let day of weekDaysToSchedule ){
    let date = new Date(now);
    date.setDate(now.getDate() + (days.indexOf(day) - currentDay))
    date.setHours(0, 0, 0, 0)
    const dayStart = parseInt(date.getTime()/1000);
    const nextDayStart = dayStart + 60 * 60 * 24;
    generateDaySchedule(schedule, day, dayStart, nextDayStart);
  };

  fs.writeFileSync(Paths.TRACKING_PATH, JSON.stringify(tracking, null, 2));
}





