import { useCallback, useEffect, useState } from "react";
import axios from 'axios';
import {AiOutlineCaretUp,AiOutlineCaretDown,AiOutlineArrowLeft, AiOutlineLoading, AiFillPlayCircle, AiOutlineEdit, AiOutlineDelete} from 'react-icons/ai';
import { useSearchParams, Link, Navigate, useNavigate } from "react-router-dom";
import {Table, Modal, InputNumber} from 'antd';
import {toast, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const config=require('../config/config')

function simplifyParams(paramString){
    const indicatorDict={
        "i_supertrend":"Supertrend",
        "i_emaCross":"EMA Cross",
        "i_atr":"Average True Range",
        "i_ema":"Exponential Moving Average (EMA)",
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
    const {profile, logOutFunc}=props;
    const [dataAvailable,setDataAvailable]=useState(false);
    const [loading,setLoading]=useState(false);
    const [stockData,setStockData]=useState([]);
    const [queryParameters]=useSearchParams();
    const [strategyMetrics,setStrategyMetrics] = useState({});
    const [industryFilter,setIndustryFilter]=useState([]);
    const [pageNotFound,setPageNotFound]=useState(false);
    const [deleteModal,setDeleteModal]=useState(false);
    const [editModal,setEditModal]=useState(false);
    const [newParameters,setNewParameters]=useState("");
    const [strategyError,setStrategyError]=useState(false);
    const screenWidth = window.innerWidth;
    const id = queryParameters.get("id");
    const date = new Date();
    const dateToday=''+date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
    const navigate = useNavigate();
    if(isNaN(id)){
        navigate("/page-not-found");
    }

    const columns = [
        {
          title: 'Company',
          dataIndex: 'name',
          width:400,
          key:'company',
          render:(_,{name,symbol})=>(
            <>
            <a href={`https://in.tradingview.com/chart/?symbol=BSE%3A${symbol}`} target="_blank" rel="noreferrer">{name}</a>
            </>
          )
        },
        {
            title: 'Symbol',
            dataIndex: 'symbol',
            width:200,
            fixed:'left',
            key:'symbol'
        },
        {
          title: 'Percent Change',
          dataIndex: 'perChange',
          defaultSortOrder: 'descend',
          width:200,
          fixed:'left',
          key:'perchange',
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
            key:'price',
            sorter: (a, b) => a.curClose - b.curClose,
            render:(_,{curClose})=>(
                <>
                    <span>{curClose.toFixed(2)}</span>
                </>
              )
        },
        {
          title: 'Industry',
          dataIndex: 'industry',
          width:300,
          key:'industry',
          filters: industryFilter,
          onFilter: (value, record) => record.industry.indexOf(value) === 0,
        },
      ];

    function handleParamEdit(index,key,value,comp){
        let params=newParameters.length>1?newParameters.split(","):strategyMetrics.parameters.split(",");
        let leftStr=params[index].split(comp)[0];
        let rightStr=params[index].split(comp)[1];
        let leftParamArr=leftStr.split('#');
        let rightParamArr=rightStr.split('#');
        switch(key){
            case 'l1': leftParamArr[1]=value;
                        break;
            case 'f1': leftParamArr[2]=value;
                        break;
            case 'l2': rightParamArr[1]=value;
                        break;
            case 'f2': rightParamArr[2]=value;
                        break;
            case 'days':leftParamArr[leftParamArr.length-1]=value;
                        rightParamArr[rightParamArr.length-1]=value;
                        break;
            default: break;
        }
        let finalParam=[leftParamArr.join('#'),rightParamArr.join('#')].join(comp);
        params[index]=finalParam;
        setNewParameters(params.join(','));
    }

    function simplifyParamsForEdit(paramString){
        const indicatorDict={
            "i_supertrend":"Supertrend",
            "i_emaCross":"EMA Cross",
            "i_atr":"Average True Range",
            "i_ema":"Exponential Moving Average (EMA)",
            "i_bbUpper":"Upper Bollinger Band",
            "green":"Green",
            "up":"Up",
            "red":"Red",
            "down":"Down",
            "i_close":"Close Price",
        }
        const params = paramString.split(',').filter(Boolean); 
    
        const outputArr = params.map((param,index) => {
            let comparator=param.includes('=')?'=':param.includes('>')?'>':'<';
            const [leftPart, rightPart] = param.split(comparator);
            const leftParts = leftPart.split('#');
            const rightParts = rightPart.split('#');
            const lastValue = rightParts[rightParts.length - 1];
    
            const leftStr = leftParts.slice(1, -1);
            const rightStr = rightParts.slice(1, -1);
            return (<div key={index}>
                        {indicatorDict[leftParts[0]]}&nbsp;
                         {leftParts[0]!=='i_close' && <InputNumber placeholder="Length" defaultValue={leftStr[0]} min={1} onChange={(value)=>{handleParamEdit(index,'l1',value,comparator)}}></InputNumber>}&nbsp;
                         {(leftStr.length>1 && leftParts[0]!=='i_close') && <InputNumber placeholder="Factor" defaultValue={leftStr[1]} min={1} onChange={(value)=>{handleParamEdit(index,'f1',value,comparator)}}></InputNumber>}&nbsp;
                         {comparator} &nbsp;
                         {indicatorDict[rightParts[0]]} &nbsp;
                         {rightStr.length>0 && <span><InputNumber placeholder="Length" defaultValue={rightStr[0]} min={1} onChange={(value)=>{handleParamEdit(index,'l2',value,comparator)}}></InputNumber>&nbsp;</span>}
                         {rightStr.length>1 && <span><InputNumber placeholder="Factor" defaultValue={rightStr[1]} min={1} onChange={(value)=>{handleParamEdit(index,'f2',value,comparator)}}></InputNumber>&nbsp;</span>}
                         since&nbsp;
                         <InputNumber placeholder="Days" defaultValue={lastValue} min={1} onChange={(value)=>{handleParamEdit(index,'days',value,comparator)}}></InputNumber>&nbsp;
                         days&nbsp;
                         <br/><br/>
                    </div>);
        });
    
        return outputArr;
    }

    function validateStrategyData(){
        let valid=true;
        newParameters.split(',').forEach(param=>{
            if(param.length<3) return;
            let comp=param.includes('=')?'=':param.includes('>')?'>':'<';
            param.split(comp).forEach(p=>{
                p.split('#').forEach(elem=>{
                    if(elem.length<1) valid=false;
                })
            })
        })
        return valid;
    }

    function runStrategy(){
        setDataAvailable(false);
        setLoading(true);
        const authToken=localStorage.getItem('git');
        axios.get(config.API_PREFIX+`/strategy?id=${id}&googleid=${profile.id}`,{
            headers:{
                Authorization: `Bearer ${authToken}`,
                "Content-Type":'application/json'
            }
        })
        .then(response=>{
            let recievedStockData={"data":response.data.data.filter(obj=>obj.perChange!==null && obj.perChange!==undefined).map((obj, index) => ({ ...obj, key: index }))};
            let runTime=new Date();
            recievedStockData["date"]=dateToday;
            let runTimeHours=runTime.getHours().length===1?'0'+runTime.getHours():runTime.getHours();
            let runTimeMinutes=runTime.getMinutes().length===1?'0'+runTime.getMinutes():runTime.getMinutes();
            recievedStockData["time"]=runTimeHours+":"+runTimeMinutes;
            setStockData(recievedStockData["data"]);
            let industries=response.data.data.map(obj=>{
                if(obj.industry===' ')return 'Mutual Funds';
                return obj.industry;
            });
            industries.sort();
            const uniqueIndustries=[...new Set(industries)];
            setIndustryFilter(uniqueIndustries.map(industry => ({
                text: industry,
                value: industry
              })))
            localStorage.setItem(`strat_${id}`,JSON.stringify(recievedStockData));
            setDataAvailable(true);
            setLoading(false);
        })
        .catch(err=>{
            if(err.response && (err.response.status===401 || err.response.status===403) ){
                toast.error(`Unauthorized, please login again`, {
                    position: "bottom-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    theme: "light",
                    transition: Flip,
                    });
                setTimeout(() => {
                    logOutFunc();
                }, 2000);
            }
            else{
                navigate("/maintainence");
            }
        })
    }

    function editStrategy(){
        if(!validateStrategyData()){
            setStrategyError(true);
            return;
        }
        else{
            setStrategyError(false);
        }
        setDataAvailable(false);
        const authToken=localStorage.getItem('git');
        axios.put(config.API_PREFIX+`/strategy?id=${id}&googleid=${profile.id}`,{newparam: newParameters}, {
            headers:{
                Authorization: `Bearer ${authToken}`,
                "Content-Type":'application/json'
            }
        })
        .then(response=>{
            localStorage.removeItem(`strat_${id}`);
            toast.success(`Updated strategy '${strategyMetrics.description}'`, {
                position: "bottom-right",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
                transition: Flip,
                });
            setTimeout(()=>{
                setEditModal(false);
                window.location.reload();
            },2000)
            
        })
        .catch(err=>{
            if(err.response && (err.response.status===401 || err.response.status===403) ){
                toast.error(`Unauthorized, please login again`, {
                    position: "bottom-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    theme: "light",
                    transition: Flip,
                    });
                setTimeout(() => {
                    logOutFunc();
                }, 2000);
            }
            else{
                navigate("/maintainence");
            }
        })

    }

    function deleteStrategy(){
        setDataAvailable(false);
        const authToken=localStorage.getItem('git');
        axios.delete(config.API_PREFIX+`/strategy?id=${id}&googleid=${profile.id}`,{
            headers:{
                Authorization: `Bearer ${authToken}`,
                "Content-Type":'application/json'
            }
        })
        .then(response=>{
            setDeleteModal(false);
            localStorage.removeItem(`strat_${id}`);
            toast.info(`Deleted strategy '${strategyMetrics.description}'`, {
                position: "bottom-right",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
                transition: Flip,
                });
            setTimeout(()=>{navigate("/");},2000);
        })
        .catch(err=>{
            if(err.response && (err.response.status===401 || err.response.status===403) ){
                toast.error(`Unauthorized, please login again`, {
                    position: "bottom-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    theme: "light",
                    transition: Flip,
                    });
                setTimeout(() => {
                    logOutFunc();
                }, 2000);
            }
            else{
                navigate("/maintainence");
            }
        })
        
    }

    const getStrategyData=useCallback(()=>{
        const authToken=localStorage.getItem('git');
        axios.get(config.API_PREFIX+`/strategymetrics?id=${id}&googleid=${profile.id}`,{
            headers:{
                Authorization: `Bearer ${authToken}`,
                "Content-Type":'application/json'
            }
        })
        .then(response=>{
            if(response.data.data===undefined){
                setPageNotFound(true);
                return;
            }
            setStrategyMetrics(response.data.data);
        })
        .catch(err=>{
            if(err.response && (err.response.status===401 || err.response.status===403) ){
                toast.error(`Unauthorized, please login again`, {
                    position: "bottom-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    theme: "light",
                    transition: Flip,
                    });
                setTimeout(() => {
                    logOutFunc();
                }, 2000);
            }
            else{
                navigate("/maintainence");
            }
        })
    },[id,profile,navigate,logOutFunc]);

    useEffect(()=>{
        getStrategyData();
        let stratDataStr=localStorage.getItem(`strat_${id}`);
        let stratData=JSON.parse(stratDataStr);
        let curTimestamp=new Date();
        let curTimeHours=curTimestamp.getHours().length===1?'0'+curTimestamp.getHours():curTimestamp.getHours();
        let curTimeMinutes=curTimestamp.getMinutes().length===1?'0'+curTimestamp.getMinutes():curTimestamp.getMinutes();
        let curTime = curTimeHours+":"+curTimeMinutes;
        if(stratData){
            let runTime=stratData.time;
            if(stratData["date"]!==undefined && runTime &&
                ((stratData["date"]===dateToday && (runTime[0]>'16:30' || (runTime[0]<'16:30' && curTime<'16:30'))) || 
                ((dateToday.split('-')[0]-stratData["date"].split('-')[0])===1 && curTime<'16:30' && runTime[0]>'16:30')
            )){
                setDataAvailable(true);
                setStockData(stratData["data"]);
            }
            else{
                localStorage.removeItem(`strat_${id}`);
            }
            
        }
    },[getStrategyData,id,dateToday]);

    function handleCancel(){
        setDeleteModal(false);
        setEditModal(false);
    }

    return(
        <div>
            {
                pageNotFound && <Navigate to="/page-not-found" replace={true} />
            }
            {
                deleteModal && <Modal
                    title="Delete Strategy"
                    open={deleteModal}
                    onOk={deleteStrategy}
                    okText="Yes, delete"
                    onCancel={handleCancel}
                    width={1000}
                >
                    Are you sure you want to delete strategy '{strategyMetrics.description}'
                </Modal>
            }
            {
                editModal && <Modal
                    title="Edit Strategy"
                    open={editModal}
                    onOk={editStrategy}
                    okButtonProps={{ disabled: newParameters.length===0 }}
                    okText="Save Strategy"
                    onCancel={handleCancel}
                    width={1000}
                >
                    {
                        simplifyParamsForEdit(strategyMetrics.parameters).map((p,index)=>{
                            return (<div key={index}>{p}</div>);
                        })
                    }
                    {
                        strategyError && <div style={{color:'red'}}>Please populate all the fields</div>
                    }
                    
                </Modal>
            }
            <br/>
            <Link to={`/dashboard`} style={{left:'0'}}>
                <AiOutlineArrowLeft className="strategy-back" size={screenWidth>=768?40:30}/>
            </Link>
            {
                strategyMetrics.hasOwnProperty("parameters") && <div>
                     <div className="strategy-metrics">
                        <div>
                            <span className="strategy-metric-desc">{strategyMetrics.description}</span>/
                            <span className="strategy-metric-element">{strategyMetrics.date}</span>
                        </div>
                        <div className="strategy-button">
                            {!loading && <AiFillPlayCircle className="icon-run" onClick={runStrategy} size={27} />}
                            {loading && <AiOutlineLoading className="loader" size={27}/>}
                            <AiOutlineEdit className="icon-edit"  onClick={()=>{setEditModal(true);}} size={27} />
                            <AiOutlineDelete className="icon-delete" onClick={()=>{setDeleteModal(true);}} size={27}/>
                        </div>
                    </div>
                    <div className="strategy-metrics-col">
                        {
                            simplifyParams(strategyMetrics.parameters).map((p,index)=>{
                                return (<div key={index} className="strategy-metric-element">{p}</div>);
                            })
                        }
                        <br/>
                        
                    </div>
                </div>
                   
            }
            <div className="stockContainer">
                <br/>
                {!dataAvailable && <div className="placeholder">
                    Ready to run this strategy!
                </div>}
                {dataAvailable && stockData.length===0 && <div className="placeholder">
                    Oops, no stocks satisfy these criterias!
                </div>}
                <br/>
                {dataAvailable && stockData.length>0 && <Table columns={columns} dataSource={stockData} style={{margin:'auto',maxWidth:'90%'}} scroll={{x: true}}/>}
            </div>
        </div>
    );
}

export default Strategy;