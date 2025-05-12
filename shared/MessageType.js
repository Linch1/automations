const MessageType = {

    // server to client
    VISIT_PROFILE:"VISIT_PROFILE",
    OPEN_BROWSER:"OPEN_BROWSER",
    
    // client to server
    CONFIG:"CONFIG",
    USER_REMOVED: "USER_REMOVED",
    POST_CREATED: "POST_CREATED",

    // extension to client
    USER_FEED: "USER_FEED",
    ERR_LOG_IN: "ERR_LOG_IN",
    USER_REMOVED: "USER_REMOVED",
    POST_CREATED: "POST_CREATED",

    // client to extension
    OPEN_URL: "OPEN_URL",
    CREATE_POST: "CREATE_POST"
    
   
    
}
export default MessageType;