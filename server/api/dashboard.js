import {getJobs,runJobActual} from './Jobs.js';

export async function getDashboardData(req, res){
    let response= await getJobs(req.query.googleid);
    res.send({message:'This is your dashboard',data:response});
}
