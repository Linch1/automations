// allows to use eval and other stuff on instagram
chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
        //console.log(details)
        let headers = details.responseHeaders.map(header => {
            if (header.name.toLowerCase() === "content-security-policy") {
                //console.log("[DEBUG] CSP intercettata:", header.value);
                let newCSP = header.value.replace(/script-src ([^;]*)/, (match, p1) => {
                    if (!p1.includes("'unsafe-eval'")) {
                        return `script-src ${p1} 'unsafe-eval' 'wasm-unsafe-eval'`;
                    }
                    return match;
                });
                newCSP = header.value.replace(/connect-src ([^;]*)/, (match, p1) => {
                    if (!p1.includes("postimg.cc")) {
                        return `connect-src *.postimg.cc http://10.0.2.2:6001 http://localhost:6002 ${p1} `;
                    }
                    return match;
                });
                return { ...header, value: newCSP };
            }
            return header;
        });

        return { responseHeaders: headers };
    },
    { urls: ["*://*.instagram.com/*"] },
    ["blocking", "responseHeaders"]
);
