export default new class {
    rewrapSocket(ws){
        let oldSend = ws.send.bind(ws);
        function newSend(obj) {
            console.log("senging", obj)
            oldSend(JSON.stringify(obj));
        }
        ws.send = newSend.bind(ws);
        return ws;
    }
    nowInSecs(){
        return parseInt(Date.now()/1000);
    }
    sleep(ms){
        return new Promise( (res) => {
            setTimeout(() => {
                res()
            }, ms);
        })
    }
    getRandomFromArray(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return null;
        const index = Math.floor(Math.random() * arr.length);
        return arr[index];
    }  
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getNextDayTimestamp(dayName) {
        const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const today = new Date();
        const currentDayIndex = today.getDay();
        const targetDayIndex = daysOfWeek.indexOf(dayName.toLowerCase());
      
        if (targetDayIndex === -1) {
          throw new Error("Invalid day name: " + dayName);
        }
      
        const daysUntilNext = (targetDayIndex - currentDayIndex + 7) % 7; // 0 if today is the target day
        const resultDate = new Date(today);
      
        if (daysUntilNext !== 0) {
          resultDate.setDate(today.getDate() + daysUntilNext);
        }
      
        resultDate.setHours(0, 0, 0, 0); // start of day
        return parseInt( resultDate.getTime()/1000 );
    }
    formatTimestampToTime(seconds) {
        const date = new Date(seconds * 1000);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
}