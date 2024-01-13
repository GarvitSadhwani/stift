import { useEffect, useState } from "react";
import axios from 'axios';
import {AiOutlineCaretUp,AiOutlineCaretDown} from 'react-icons/ai';
const config=require('../config/config')

function formatData(data){
    console.log("data: ",data);
    return data.map((item, index) => (
        item.perChange!=null && 
        <tr>
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
        </tr>
        ));
}

function Dashboard(){
    const [message,setMessage]=useState("");
    const [dataAvailable,setDataAvailable]=useState(false);
    const [loading,setLoading]=useState(false);
    const [stockData,setStockData]=useState([]);

    function getDash(){
        setDataAvailable(false);
        setLoading(true);
        axios.get(config.API_PREFIX+'/dashboard')
        .then(response=>{
            setMessage(response.data.message);
            setStockData(response.data.data);
            setDataAvailable(true);
            setLoading(false);
        })
        .catch(err=>{
            console.log("err: ",err);
        })
    }

    return(
        <div>
            Dashboard
            <br/>
            <button onClick={getDash} className="stockDataButton">get Data</button>
            <div className="stockContainer">
                {loading && <img className="loader" src="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/6d391369321565.5b7d0d570e829.gif"/>}
                <br/>
                {message}
                <br/>
                {dataAvailable && <table>
                    <tr><th>Company</th><th>Symbol</th><th>Percent Change</th><th>Price</th><th>Industry</th></tr>
                    {formatData(stockData)}
                </table>}
            </div>
        </div>
    );
}

export default Dashboard;