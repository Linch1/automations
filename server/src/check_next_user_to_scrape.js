import ServerUtils from "./utils/ServerUtils.js";

let platform = "instagram";
console.log(ServerUtils.getUsersToScrapeSinceLast(platform))
console.log(ServerUtils.getNextUserToScrape(platform, "matteo.carassiti"))