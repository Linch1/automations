import ServerWs from "./ServerWs.js";
import Utils from "./utils/Utils.js";

let requestMap = {};
async function allEventHandler(debuggeeId, message, params) {
    if (message === "Network.responseReceived" &&
        params.response.url.includes("https://www.instagram.com/graphql/query")) {
        requestMap[params.requestId] = {
            url: params.response.url,
            type: params.type,
            timestamp: Date.now()
        };
    }

    if (message === "Network.loadingFinished" && requestMap[params.requestId]) {
        // Ora è sicuro fare getResponseBody
        chrome.debugger.sendCommand(
            { tabId: debuggeeId.tabId },
            "Network.getResponseBody",
            { requestId: params.requestId },
            function(response) {
                if (chrome.runtime.lastError) {
                    console.error("Error getting response body:", chrome.runtime.lastError.message);
                    delete requestMap[params.requestId];
                    return;
                }

                try {
                    const data = JSON.parse(response.body)?.data;
                    const postsProperty = "xdt_api__v1__feed__user_timeline_graphql_connection";
                    if (data?.[postsProperty]) {
                        console.log("Response Body:", data[postsProperty].edges);
                        ServerWs.emit("USER_FEED", data[postsProperty].edges);
                    }
                } catch (err) {
                    console.warn("Failed to parse response:", err);
                }

                delete requestMap[params.requestId];
            }
        );
    }
}

chrome.debugger.onEvent.addListener(allEventHandler);