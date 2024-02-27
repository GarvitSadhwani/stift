import {getJobById, runJob,runJobActual,storeJob} from './Jobs.js';

export async function runStrategy(req, res){    
    //runJob(36);
    //res.json({message:'This is your dashboard'}); 
    console.log("id: ",req.query.id) 
    let response=await runJobActual(req.query.id,req.query.googleid);
    res.send({message:"Crunched data for you!",data:response});
        
}

export async function storeStrategyData(req, res){    
    //runJob(36);
    //res.json({message:'This is your dashboard'});
    let response=await storeJob(req.body);
    //res.send({message:"Crunched data for you!",data:response});
        
}

export async function getStrategyData(req, res){    
    //runJob(36);
    //res.json({message:'This is your dashboard'}); 
    let response=await getJobById(req.query.id,req.query.googleid);
    res.send({message:"Crunched data for you!",data:response});
        
}


