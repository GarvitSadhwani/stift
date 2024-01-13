import pool from '../Postgresql.js';

export async function insertData(){
    const query = {
        text: 'INSERT INTO jobs(username, parameters) VALUES($1, $2);',
        values: ['garvit', 'i_ema#100>i_ema#200,']
      };
    await pool.query(query);
    
}

export async function getData(jobId){
    const query = {
        text: 'SELECT * FROM jobs WHERE id = $1',
        values: [jobId]
      };
    
    let result=await pool.query(query);
  
    return result.rows[0].parameters;
}




