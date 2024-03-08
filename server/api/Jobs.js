import {getIdData,getData, insertStrategy, deleteIdData, updateIdData} from './DbUtils.js';
import { promises as fsPromises } from 'fs';
import * as indicatorFunctions from './Indicators.js';
import {APIS_FILE,STOCKS_FILE} from '../config/config.js';

function parseParam(parameter){
    let ind=(parameter.match(/i_/g) || []).length;
    let parsed={};
    let comparator = parameter.match(/[><=]/);
    if(!comparator) return {};
    let values=parameter.split(comparator[0]);
    parsed["comp"]=comparator[0];
    if(ind==1){
        parsed["type"]=1;
        let indicatorArr=values[0].split('#');
        parsed["indicatorFunc"]=indicatorArr[0];
        parsed["arguments"]=indicatorArr.slice(1);

        let valueArr=values[1].split('#');
        parsed['value']=valueArr[0];
        parsed['length']=parseInt(valueArr[1]);
    }
    else{
        parsed["type"]=2;
        let indicatorArr=values[0].split('#');
        parsed["indicatorFunc1"]=indicatorArr[0];
        parsed["arguments1"]=indicatorArr.slice(1);
        indicatorArr=values[1].split('#');
        parsed["indicatorFunc2"]=indicatorArr[0];
        parsed["arguments2"]=indicatorArr.slice(1);
    }
    return parsed;
}

export async function getJobs(googleid){
    const jobs=await getData(googleid);
    let response=jobs;
    return response;
}

export async function getJobById(id,googleid){
    const jobs=await getIdData(id,googleid);
    let response=jobs;
    return response;
}

export async function deleteJobById(id,googleid){
    const response=await deleteIdData(id,googleid);
    return response;
}

export async function updateJob(id,googleid,newparam){
    const response=await updateIdData(id,googleid,newparam);
    return response;
}

export async function runJob(jobId){
    const indicatorApisFile = await fsPromises.readFile(APIS_FILE, 'utf8');
    const indicatorApis=JSON.parse(indicatorApisFile);
    const stockFile=await fsPromises.readFile(STOCKS_FILE, 'utf8');
    let stocksJson=JSON.parse(stockFile);
    let stocks=stocksJson["0"].map(stock=>stock["symbol"]);

    const parameters=await getIdData(jobId);
    console.log("param: ",parameters);
    let allParams=parameters.split(",");
    for(let param of allParams){
        let fetchData=parseParam(param);
        console.log("fetch: ",fetchData)
        if(fetchData.hasOwnProperty("type")){
            switch(fetchData.type){
                case 1: break;
                case 2: console.log("getting: ",fetchData.indicatorFunc1);
                        let val1=await indicatorFunctions[fetchData.indicatorFunc1]('ABB',...fetchData.arguments1);
                        let val2=await indicatorFunctions[fetchData.indicatorFunc2]('ABB',...fetchData.arguments2);
                        console.log("bb upper: ",val1);
                        console.log("price: ",val2);

                        
            }
        }
    }

}

export async function runJobActual(jobId,googleid){
    const stockFile=await fsPromises.readFile(STOCKS_FILE, 'utf8');
    let stocksJson=JSON.parse(stockFile);
    let stocks=stocksJson["0"].map(stock=>stock["symbol"]);
    let qualifiedStocks=[];

    const strategy=await getIdData(jobId,googleid);
    console.log("strat: ",strategy)
    let allParams=strategy.parameters.split(",");
    console.log("starting job");
    for(let param of allParams){
        if(param.length==0) continue;
        let fetchData=parseParam(param);
        console.log("fetch: ",fetchData)
        for(let stock of stocks){
            let qualified=true;
            switch(fetchData.type){
                case 1: let indicatorValue=await indicatorFunctions[fetchData.indicatorFunc](stock,...fetchData.arguments);
                        if(indicatorValue.length==0) continue;
                        let value=Array(fetchData.length).fill(fetchData.value);
                        if(fetchData.indicatorFunc=='i_supertrend'){
                            value=['red',...value];
                        }
                        for(let i=value.length-1,j=indicatorValue.length-1;i>=0 && j>=0;i--,j--){
                            switch(fetchData.comp){
                                case '>': if(indicatorValue[j]<=value[i]) qualified=false; break;
                                case '<': if(indicatorValue[j]>=value[i]) qualified=false; break;
                                case '=': if(indicatorValue[j]!=value[i]) qualified=false; break;
                            }
                            if(!qualified) break;
                        }
                        if(qualified) qualifiedStocks.push(stock);
                        break;
                case 2: let indicatorValue1=await indicatorFunctions[fetchData.indicatorFunc1](stock,...fetchData.arguments1);
                        let indicatorValue2=await indicatorFunctions[fetchData.indicatorFunc2](stock,...fetchData.arguments2);
                        if(indicatorValue1.length==0 || indicatorValue2.length==0) continue;
                        for(let i=indicatorValue2.length-1,j=indicatorValue1.length-1;i>=0 && j>=0;i--,j--){
                            switch(fetchData.comp){
                                case '>': if(indicatorValue1[j]<=indicatorValue2[i]) qualified=false; break;
                                case '<': if(indicatorValue1[j]>=indicatorValue2[i]) qualified=false; break;
                                case '=': if(indicatorValue1[j]!=indicatorValue2[i]) qualified=false; break;
                            }
                            if(!qualified) break;
                        }
                        if(qualified) qualifiedStocks.push(stock);
            }
        }
        stocks=qualifiedStocks;
        qualifiedStocks=[]; 
    }
    console.log("filtered stocks: ",stocks.length);
    let response=await Promise.all(stocksJson["0"]
                    .filter(stock=>stocks.includes(stock.symbol))
                    .map(async stock => {
                        const [perChange,curClose]= await indicatorFunctions["getPercentChangeAndClose"](stock.symbol);
                        return{
                        ...stock,
                        "perChange": perChange,
                        "curClose": curClose
                    }})
                    );
    response=response.sort((a, b) => b.perChange - a.perChange);
    return response;

}

export async function storeJob(strategy){
    const jobs=await insertStrategy(strategy);
    let response=jobs;
    return response;
}
