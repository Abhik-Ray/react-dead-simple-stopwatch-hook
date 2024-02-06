export const decorateTimeStamp = (ms: number): string => {
    ms = Math.abs(ms);
  
    const minutes = Math.floor(ms / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    const remainingMilliseconds = ms % 1000;
  
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");
    const formattedMilliseconds = String(remainingMilliseconds).padStart(3, "0");
  
    const formattedTime = `${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`;
  
    return formattedTime;
  }
