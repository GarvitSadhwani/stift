import {getJobById,deleteJobById, runJob,runJobActual,storeJob,updateJob} from './Jobs.js';

export async function runStrategy(req, res){    
    //runJob(36);
    console.log("id: ",req.query.id) 
    let response=await runJobActual(req.query.id,req.query.googleid);
    res.send({message:"Crunched data for you!",data:response});
        
}

export async function storeStrategyData(req, res){
    let response=await storeJob(req.body);  
    res.send({message:"Added Strategy!",data:response});
}

export async function getStrategyData(req, res){
    let response=await getJobById(req.query.id,req.query.googleid);
    res.send({message:"Crunched data for you!",data:response});   
}

export async function deleteStrategy(req, res){
    let response=await deleteJobById(req.query.id,req.query.googleid);
    res.send({message:"Deleted strategy",data:response});
        
}

export async function updateStrategy(req, res){
    let response=await updateJob(req.query.id,req.query.googleid, req.body.newparam);
    res.send({message:"Updated strategy",data:response});
        
}


