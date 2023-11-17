const express=require('express');
const cors=require('cors');
const { getDashboardData } = require('./api/dashboard');
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
