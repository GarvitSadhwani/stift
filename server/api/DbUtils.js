import pool from '../Postgresql.js';

export async function insertStrategy(strategy){
  console.log("recieved strat: ",strategy);
    const query = {
        text: 'INSERT INTO jobs(username, date, description, parameters, googleid, email) VALUES($1, $2, $3, $4, $5, $6);',
        values: [strategy.username, strategy.date, strategy.description, strategy.parameter, strategy.googleid, strategy.email]
      };
    await pool.query(query);
    
}

export async function getData(googleid){
  const query = {
      text: 'SELECT * FROM jobs WHERE googleid = $1',
      values: [googleid]
    };
  
  let result=await pool.query(query);
  return result.rows;
}

export async function getIdData(jobId,googleid){
    const query = {
        text: 'SELECT * FROM jobs WHERE id = $1 AND googleid = $2',
        values: [jobId,googleid]
      };
    
    let result=await pool.query(query);
  
    return result.rows[0];
}




