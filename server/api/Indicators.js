import { promises as fsPromises } from 'fs';

function i_atr_util(stock,duration){
    let stockSmall={"open":[],"high":[],"low":[],"close":[]}
    let dataLength=52;
    stockSmall["open"]=stock.quote[0].open.slice(-dataLength);
    stockSmall["high"]=stock.quote[0].high.slice(-dataLength);
    stockSmall["low"]=stock.quote[0].low.slice(-dataLength);
    stockSmall["close"]=stock.quote[0].close.slice(-dataLength);
    let trArr=[];
    for(let i=1;i<dataLength;i++){
        trArr.push(Math.max((stockSmall.high[i] - stockSmall.low[i]), Math.abs(stockSmall.high[i] - stockSmall.close[i-1]), Math.abs(stockSmall.low[i] -stockSmall.close[i-1])));
    }
    let atrArr=[];
    let atr=0;
    for(let i=0;i<duration;i++){
        atr+=trArr[i];
    }
    atr/=duration;
    atr=(Math.round(atr * 100) / 100).toFixed(2);
    atrArr.push(atr);
    for(let i=duration;i<dataLength-1;i++){
        atr=(atrArr[i-duration]*(duration-1)+trArr[i])/duration;
        atr=(Math.round(atr * 100) / 100).toFixed(2);
        atrArr.push(atr);
    }

    return atrArr;
}

export async function i_atr(symbol,length,numIntervals){
    let stockFile;
    try{
        stockFile = await fsPromises.readFile('./stocks/'+symbol+'.json', 'utf8');
    }
    catch(err){
        return [];
    }
    const stock=JSON.parse(stockFile);
    let atrArr=i_atr_util(stock,parseInt(length));

    return atrArr.slice(-numIntervals);
}

export async function i_bbUpper(symbol,length,multiplier,numIntervals){
    let closePrice=await i_close(symbol,parseInt(length)+parseInt(numIntervals)+50);
    for(let i=1;i<parseInt(length)+parseInt(numIntervals)+50;i++){
        if(closePrice[i]==null){
            closePrice[i]=closePrice[i-1];
        }
    }
    closePrice=closePrice.slice(-length-numIntervals);
    let bbUpper=[];
    for(let i=0;i<numIntervals;i++){
        let subset = closePrice.slice(i, i+length); 
        let mean = subset.reduce((sum, value) => sum + value, 0) / length;
        let squaredDifferences = subset.map(value => Math.pow(value - mean, 2));
        let variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / length;
        let standardDeviation = Math.sqrt(variance);
        console.log("mean: ",mean);
        bbUpper.push(mean + multiplier*standardDeviation);
    }
    
    return bbUpper;
}

export async function i_close(symbol,numIntervals){
    let stockFile;
    try{
        stockFile = await fsPromises.readFile('./stocks/'+symbol+'.json', 'utf8');
    }
    catch(err){
        return [];
    }
    const stock=JSON.parse(stockFile);
    if(!stock.quote[0].hasOwnProperty("close")){
        return Array(numIntervals).fill("err");
    }
    return stock.quote[0].close.slice(-numIntervals);
}

export async function i_ema(symbol,interval,numIntervals){
    let duration=parseInt(interval);
    let stockFile;
    try{
        stockFile = await fsPromises.readFile('./stocks/'+symbol+'.json', 'utf8');
    }
    catch(err){
        return [];
    }
    const stock=JSON.parse(stockFile);
    let closeArray=stock.quote[0].close;
    if(!closeArray) return [];
    let emaArray = [closeArray[0]];
    let k=2/(duration+1);
    let n=closeArray.length;
    let prevEma=closeArray[0];
    for (let i = 1; i < n; i++) {
        if(closeArray[i]!=null){
            emaArray.push(closeArray[i] * k + prevEma * (1 - k));
            prevEma=closeArray[i] * k + prevEma * (1 - k);
        }
        else{
            emaArray.push(prevEma);
        }
        
    }
    return emaArray.slice(-numIntervals);
}

export async function i_emaCross(symbol,short,long,numIntervals){
    let ema_short=await i_ema(symbol,short,numIntervals);
    let ema_long=await i_ema(symbol,long,numIntervals);
    let res=[];
    for(let i=0;i<numIntervals;i++){
        if(ema_short[i]>ema_long[i]){
            res.push('up');
        }
        else{
            res.push('down');
        }
    }
    return res;
}

export async function i_supertrend(symbol,length,multiplier,numIntervals){
    let duration=parseInt(length);
    let mul=parseInt(multiplier);
    let stockFile;
    try{
        stockFile = await fsPromises.readFile('./stocks/'+symbol+'.json', 'utf8');
    }
    catch(err){
        return [];
    }
    
    const stock=JSON.parse(stockFile);
    if(!stock.quote[0].hasOwnProperty("open")){
        return Array(numIntervals).fill("err");
    }
    let atrArr=i_atr_util(stock,duration);
    let prevUpper=10000;
    let prevLower=0;
    let supertrend=[];
    let trend=0;
    let stockSmall={"open":[],"high":[],"low":[],"close":[]}
    let dataLength=52;
    stockSmall["open"]=stock.quote[0].open.slice(-dataLength);
    stockSmall["high"]=stock.quote[0].high.slice(-dataLength);
    stockSmall["low"]=stock.quote[0].low.slice(-dataLength);
    stockSmall["close"]=stock.quote[0].close.slice(-dataLength);

    for(let i=duration-1;i<dataLength;i++){
        trend+=(stockSmall["close"][i]-stockSmall["close"][i-1]);
        let high=0;
        let low=10000;
        for(let j=i;j>i-duration;j--){
            high=Math.max(high,stockSmall["high"][i]);
            low=Math.min(low,stockSmall["low"][i]);
        }
        let avPrice=(high+low)/2;
        let curUpper=avPrice + (atrArr[i-duration])*mul;
        let curLower=avPrice - (atrArr[i-duration])*mul;
        let finalUpper=(curUpper<prevUpper || stockSmall["close"][i-1]>prevUpper)?curUpper:prevUpper;
        let finalLower=(curLower>prevLower || stockSmall["close"][i-1]< prevLower)?curLower:prevLower;
        prevUpper=finalUpper;
        prevLower=finalLower;
        if(stockSmall["close"][i]>finalUpper)
            supertrend.push('green');
        else if(stockSmall["close"][i]<finalLower)
            supertrend.push('red');
        else{
            if(supertrend.length==0) supertrend.push('uncertian');
            else supertrend.push(supertrend[supertrend.length-1]);
        }
    }
    if(supertrend[supertrend.length-1]=='uncertian'){
        if(trend>0){
            supertrend=Array(supertrend.length).fill('green');
        }
        else{
            supertrend=Array(supertrend.length).fill('red');
        }
    }
    
    return supertrend.slice(-numIntervals);
}

export async function getPercentChange(symbol){
    let stockFile;
    try{
        stockFile = await fsPromises.readFile('./stocks/'+symbol+'.json', 'utf8');
    }
    catch(err){
        return NaN;
    }
    const stock=JSON.parse(stockFile);

    const [oldPrice,newPrice]=stock.quote[0].close.slice(-2);
    return ((newPrice-oldPrice)/oldPrice)*100;
}