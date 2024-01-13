import express from 'express';
import cors from 'cors';
import {getDashboardData} from './api/Dashboard.js'
const app=express();
const port=3030;

app.use(cors());

app.get('/',(req, res) => {      
    const data= {message:'Stift backend'};
    res.json(data);      
});

app.get('/dashboard',getDashboardData);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`); 
});
