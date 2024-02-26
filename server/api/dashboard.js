import {getJobs,runJobActual} from './Jobs.js';

export async function getDashboardData(req, res){    
    let response= await getJobs(req.query.googleid);
    res.send({message:'This is your dashboard',data:response});  
    //let response=await runJobActual(38);
    //res.send({message:"Crunched data for you!",data:response});
}
