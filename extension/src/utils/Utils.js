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
    sleep(ms) {
        return new Promise( (res) => {
            setTimeout( res, ms );
        });
    }

   
}

export default Utils;