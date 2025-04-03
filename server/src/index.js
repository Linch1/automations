import Ws from "./lib/Ws.js";
import ServerUtils from "./utils/ServerUtils.js";
import "./lib/ServerStatic.js"
import {config} from "dotenv";
config();

Ws.run();
setTimeout( () => {
    ServerUtils.checkUsersToScrape();
}, 60 * 1000)
