import ServerWs from "./ServerWs.js";
import RequestsUtils from "./utils/RequestsUtils.js";

export default function getInstagramTab(){
    return new Promise((res, rej) => {
        let i = setInterval(() => {
            chrome.tabs.query(
                { currentWindow: true, url: "https://www.instagram.com/*" },
                async function(tabArray) {
                    if (tabArray.length === 0) return;
                    let currentTab = tabArray[0];
                    clearInterval(i);
                    console.log("Found tab, clearing interval interval_id=", i);
        
                    // check if logged in
                    try {
                        console.log("Waiting for selector");
                        await RequestsUtils.waitForSelector("[aria-label='Cerca']");
                        console.log("Selector found")
                    } catch (error) {
                        ServerWs.emit("ERR_LOG_IN", {});
                        throw new Error(error);
                    }
                    //
        
                    try {
                        chrome.debugger.attach({ tabId: currentTab.id }, "1.0", function() {
                            if (chrome.runtime.lastError) {
                                console.error("Error attaching debugger:", chrome.runtime.lastError.message);
                                return;
                            }
                            res(currentTab.id)
                        });
                    } catch (e) {
                        console.error("Exception attaching debugger:", e);
                    }
                }
            );
        }, 1000);
    })
}