const Utils = new class {
    executeCode(code) {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, {
                type: "EXECUTE_CODE",
                payload: {code}
            });
            });
        });
    }
    getTabUrl(tabId){
        return new Promise( (res) => {
            chrome.tabs.get(tabId, function(tab) {
                if (chrome.runtime.lastError) {
                    console.error("Error getting tab info:", chrome.runtime.lastError.message);
                    return;
                }
                res(tab.url)
            });
        })
        
    }
    sleep(ms) {
        return new Promise( (res) => {
            setTimeout( res, ms );
        });
    }

   
}

export default Utils;