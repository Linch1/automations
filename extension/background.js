import Actions from "./src/Actions.js";
import NetworkRequests from "./src/NetworkRequests.js";
import ServerWs from "./src/ServerWs.js";
import "./src/chrome_allow_eval.js";
import "./src/chrome_listen_debugger.js";
import getInstagramTab from "./src/chrome_query_tab.js";



function openUrl(url){
    return new Promise( res => {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const tab = tabs[0];
            
            chrome.debugger.attach({ tabId: tab.id }, "1.0", function() {
                if (chrome.runtime.lastError) {
                    console.error("Error attaching debugger:", chrome.runtime.lastError.message);
                    return;
                }
                chrome.debugger.sendCommand({ tabId: tab.id }, "Network.enable", {}, function() {
                    if (chrome.runtime.lastError) {
                        console.error("Errore Network.enable:", chrome.runtime.lastError.message);
                        return;
                    }
                    // Una volta pronto, forza il redirect verso la pagina target
                    chrome.tabs.update(tab.id, { url: url });
                    res()
                });
            });
        });
    });
}


(async () => {
    
    console.log("Extension Running");

    ServerWs.on("OPEN_URL", async (payload) => {

        console.log("Recived OPEN_URL request", payload);
        let {feedUrl, reelsUrl, url, username} = payload;
        
        await openUrl(feedUrl);
        let userFeedKey = "xdt_api__v1__feed__user_timeline_graphql_connection"
        let userFeed = await NetworkRequests.listenForBodyKey(userFeedKey);
        let userEdges = userFeed[userFeedKey].edges;

        await openUrl(reelsUrl);
        let reelsFeedKey = "xdt_api__v1__clips__user__connection_v2"
        let reelsFeed = await NetworkRequests.listenForBodyKey(reelsFeedKey);
        let reelsEdges = reelsFeed[reelsFeedKey].edges;

        for( let userEdge of userEdges ){
            let reel = reelsEdges.find( e => e.node.media.id == userEdge.node.id );
            userEdge.node.play_count = reel.node.media.play_count;
        }

        console.log(`scraped user feed for ${username}`, scrapedEdges);
        ServerWs.emit("USER_FEED", {edges: userEdges, tabUrl: feedUrl});
        
    });

    ServerWs.on("CREATE_POST", (payload) => {
        let {url, fileUrl, filePath, caption} = payload;
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const tab = tabs[0];
            chrome.tabs.update(tab.id, { url: url }, function(updatedTab) {
                const listener = async function(tabId, changeInfo, newTab) {
                  if (tabId === updatedTab.id && changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);
                    console.log('✅ Pagina caricata:', newTab.url);
                    await Actions.createPost(filePath, caption)
                    ServerWs.emit("POST_CREATED", payload);
                  }
                };
                chrome.tabs.onUpdated.addListener(listener);
            });

        });

    })

    await ServerWs.waitForOpen();
    console.log("Socket open");

    
    //let instagramTabId = await getInstagramTab();
    //console.log("Instagram tabid=",instagramTabId);
    //chrome.debugger.sendCommand({ tabId: instagramTabId }, "Network.enable");

})();