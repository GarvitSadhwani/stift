import express from 'express';
import cors from 'cors';
import {getDashboardData} from './api/Dashboard.js'
import {runStrategy,getStrategyData,storeStrategyData,deleteStrategy,updateStrategy} from './api/Strategy.js'
const app=express();
const port=3030;

app.use(cors());
app.use(express.json());

app.get('/',(req, res) => {      
    const data= {message:'Stift backend'};
    res.json(data);      
});

app.get('/strategy',runStrategy);
app.delete('/strategy',deleteStrategy);
app.put('/strategy',updateStrategy);
app.get('/strategymetrics',getStrategyData);
app.get('/dashboard',getDashboardData);
app.post('/storestrategy',storeStrategyData);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`); 
});
