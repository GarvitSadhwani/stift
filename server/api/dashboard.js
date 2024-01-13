import {runJob,runJobActual} from './Jobs.js';

export async function getDashboardData(req, res){    
    runJob(36);
    res.json({message:'This is your dashboard'});  
    //let response=await runJobActual(38);
    //res.send({message:"Crunched data for you!",data:response});
        
}
