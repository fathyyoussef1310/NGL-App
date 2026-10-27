export function toMins(time,unit){
    switch(unit){
        case "seconds":
            return time * 1000;
        case "minutes":
            return time * 60 * 1000;
        case "hours":
            return time * 60 * 60 * 1000;
        case "days":
            return time * 60 * 60 * 1000 *24;
        default:
            return time;
    }
}
