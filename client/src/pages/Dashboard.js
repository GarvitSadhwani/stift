import { useEffect, useState } from "react";
import axios from 'axios';
const config=require('../config/config')

function Dashboard(){
    const [data,setData]=useState("");

    useEffect(()=>{
        axios.get(config.API_PREFIX+'/dashboard')
        .then(response=>{
            setData(response.data.message);
        })
        .catch(err=>{
            console.log("err: ",err);
        })
    },[]);

    return(
        <div>
            Dashboard
            {data}
        </div>
    );
}

export default Dashboard;