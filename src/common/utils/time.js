export function toMins(time,unit){
    switch(unit){
        case "seconds":
            time *1000;
        case "minutes":
            time * 60 * 1000;
        case "hours":
            time * 60 * 60 * 1000;
        default:
            return time;
    }
}
