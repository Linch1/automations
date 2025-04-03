import MasterWsClient from "./lib/master/Ws.js";
import ExtensionWsServer from "./lib/extension/Ws.js";
import MessagesHandler from "./lib/master/MessagesHandler.js";
import MessageType from "../../shared/MessageType.js";


console.log("connecting to master socket")
MasterWsClient.run();
await MasterWsClient.waitForOpen();

console.log("starting extensions server")
ExtensionWsServer.run();

