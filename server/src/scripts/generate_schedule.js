import { enrichTrackingWithNewUsers, generateSchedule } from "../lib/schedule_functions.js";
enrichTrackingWithNewUsers();
generateSchedule();
console.log('✅ weekly.json generato con successo.');