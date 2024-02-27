import { useEffect, useState } from "react";
import axios from 'axios';
import {AiOutlineCaretUp,AiOutlineCaretDown,AiOutlineArrowLeft, AiOutlineLoading, AiFillPlayCircle, AiOutlineEdit} from 'react-icons/ai';
import { useSearchParams, Link } from "react-router-dom";
import {Table} from 'antd';
const config=require('../config/config')

function formatData(data){
    console.log("data: ",data);
    return data.map((item, index) => {
        if(item["perChange"] && item["curClose"][0]){
            return (<tr>
                <td>{item["name"]}</td>
                <td>{item["symbol"]}</td>
                {
                    item["perChange"]>=0 && <td style={{color:'green'}}><AiOutlineCaretUp/>{item["perChange"].toFixed(2)} %</td>
                }
                {
                    item["perChange"]<0 && <td style={{color:'red'}}><AiOutlineCaretDown/>{item["perChange"].toFixed(2)} %</td>
                }
                
                <td>{item["curClose"][0].toFixed(2)}</td>
                <td>{item["industry"]}</td>
            </tr>);
        }
        else return (<></>);
    });
}

function simplifyParams(paramString){
    const indicatorDict={
        "i_supertrend":"Supertrend",
        "i_emaCross":"EMA Cross",
        "i_atr":"Average True Range",
        "i_ema":"Exponential Moving Average (EMA)",
        "i_supertrend":"Supertrend",
        "i_bbUpper":"Upper Bollinger Band",
        "green":"Green",
        "up":"Up",
        "red":"Red",
        "down":"Down",
        "i_close":"Close Price",
    }
    const params = paramString.split(',').filter(Boolean); 

    const outputArr = params.map(param => {
        let comparator=param.includes('=')?'=':param.includes('>')?'>':'<';
        const [leftPart, rightPart] = param.split(comparator);
        const leftParts = leftPart.split('#');
        const rightParts = rightPart.split('#');
        const lastValue = rightParts[rightParts.length - 1];

        const leftStr = leftParts.slice(1, -1).join(' ');
        const rightStr = rightParts.slice(1, -1).join(' ');

        return `${indicatorDict[leftParts[0]]} ${leftStr} ${comparator} ${indicatorDict[rightParts[0]]} ${rightStr} since ${lastValue} days`;
    });

    return outputArr;
}

function Strategy(props){
    const {profile}=props;
    const [message,setMessage]=useState("");
    const [dataAvailable,setDataAvailable]=useState(false);
    const [loading,setLoading]=useState(false);
    const [stockData,setStockData]=useState([]);
    const [queryParamters]=useSearchParams();
    const [strategyMetrics,setStrategyMetrics] = useState({});
    const [industryFilter,setIndustryFilter]=useState([]);
    const id = queryParamters.get("id");
    console.log("id :",id);

    const columns = [
        {
          title: 'Company',
          dataIndex: 'name',
          width:400
        },
        {
            title: 'Symbol',
            dataIndex: 'symbol',
            width:200
        },
        {
          title: 'Percent Change',
          dataIndex: 'perChange',
          defaultSortOrder: 'descend',
          width:200,
          sorter: (a, b) => a.perChange - b.perChange,
          render:(_,{perChange})=>(
            <>
                {
                    perChange>=0 && <span style={{color:'green'}}><AiOutlineCaretUp/>{perChange.toFixed(2)} %</span>
                }
                {
                    perChange<0 && <span style={{color:'red'}}><AiOutlineCaretDown/>{perChange.toFixed(2)} %</span>
                }
            </>
          )
        },
        {
            title: 'Price',
            dataIndex: 'curClose',
            width:200,
            sorter: (a, b) => a.curClose - b.curClose,
            render:(_,{curClose})=>(
                <>
                    <span>{curClose[0].toFixed(2)}</span>
                </>
              )
        },
        {
          title: 'Industry',
          dataIndex: 'industry',
          width:300,
          filters: industryFilter,
          onFilter: (value, record) => record.industry.indexOf(value) === 0,
        },
      ];

    function runStrategy(){
        setDataAvailable(false);
        setLoading(true);
        axios.get(config.API_PREFIX+`/strategy?id=${id}&googleid=${profile.id}`)
        .then(response=>{
            console.log("strat data: ",response);
            setMessage(response.data.message);
            setStockData(response.data.data.filter(obj=>obj.perChange!=null));
            let industries=response.data.data.map(obj=>{
                if(obj.industry==' ')return 'Mutual Funds';
                return obj.industry;
            });
            industries.sort();
            const uniqueIndustries=[...new Set(industries)];
            setIndustryFilter(uniqueIndustries.map(industry => ({
                text: industry,
                value: industry
              })))
            console.log("indus: ",industryFilter)
            setDataAvailable(true);
            setLoading(false);
        })
        .catch(err=>{
            console.log("err: ",err);
        })
    }

    function getStrategyData(){
        axios.get(config.API_PREFIX+`/strategymetrics?id=${id}&googleid=${profile.id}`)
        .then(response=>{
            setStrategyMetrics(response.data.data);
            console.log("response: ",response.data.data);
        })
        .catch(err=>{
            console.log("err: ",err);
        })
    }

    useEffect(()=>{
        getStrategyData();
    },[]);

    return(
        <div>
            <br/>
            <Link to={`/dashboard`} style={{left:'0'}}>
                <AiOutlineArrowLeft style={{position:'absolute', left:'5%',marginTop:'10px'}} size={40}/>
            </Link>
            {
                strategyMetrics.hasOwnProperty("parameters") && <div className="strategy-metrics">
                    <span className="strategy-metric-desc">{strategyMetrics.description}</span>/
                    <span className="strategy-metric-element">{strategyMetrics.date}</span>
                    {!loading && <AiFillPlayCircle className="strategy-button" style={{cursor:"pointer"}} onClick={runStrategy} size={30} />}
                    {loading && <AiOutlineLoading className="loader strategy-button" size={30}/>}
                    <AiOutlineEdit style={{cursor:"pointer",marginLeft:'10px'}} size={30}/>
                </div>
            }
            {
                strategyMetrics.hasOwnProperty("parameters") && <div className="strategy-metrics-col">
                    {
                        simplifyParams(strategyMetrics.parameters).map(p=>{
                            return (<div className="strategy-metric-element">{p}</div>);
                        })
                    }
                    <br/>
                    
                </div>
            }
            
            <div className="stockContainer">
                <br/>
                {!dataAvailable && <div className="placeholder">
                    Ready to run this strategy!
                </div>}
                {dataAvailable && stockData.length==0 && <div className="placeholder">
                    Oops, no stocks satisfy these criterias!
                </div>}
                {dataAvailable && <Table columns={columns} dataSource={stockData} />}
            </div>
        </div>
    );
}

export default Strategy;