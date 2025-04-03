function send({id, response}){
  console.log("sending: ", id, response);
  chrome.runtime.sendMessage({id, response});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("RECIVED REQUEST=", request);
  if (request.type === "EXECUTE_CODE") {
    let res = eval(request.payload.cmd);
    send({id:request.id, response: res});
  } 
});
console.log("INJECTED CONTENT.JS")
