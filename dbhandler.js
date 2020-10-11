const pg = require('pg');
const dbURI = "postgres://smjohccvlrjzzg:19d8a23fb3ce3ca39e46a5d1aceae68d06d17f8f75eb737971becc481a5dca6a@ec2-54-228-209-117.eu-west-1.compute.amazonaws.com:5432/de7d0rka7uh8a0";
const connstring  = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({ connectionString: connstring, ssl: { rejectUnauthorized: false } });

let dbhandler = {};   

// ---------------------------------------
dbhandler.addUser = async function(email, psw, avatar) {
    let sql = 'INSERT INTO users (id, email, psw, avatar) VALUES(DEFAULT, $1, $2, $3) RETURNING id, email, avatar';
    let values = [email, psw, avatar];
    let result = await pool.query(sql, values);
    return result.rows;
}

// ---------------------------------------
dbhandler.getUser = async function(id) {
    let sql = 'SELECT id, email, avatar FROM users WHERE id = $1';
    let values = [id];
    let result = await pool.query(sql, values);
    return result.rows;
}

// ---------------------------------------
dbhandler.getUserPsw = async function(email) {
    let sql = 'SELECT id, email, psw FROM users WHERE email = $1';
    let values = [email];
    let result = await pool.query(sql, values);
    return result.rows;
}

// ---------------------------------------
dbhandler.getUsers = async function() {
    let sql = 'SELECT id, email, avatar FROM users ORDER BY email';
    let result = await pool.query(sql);
    return result.rows;
}

// ---------------------------------------
dbhandler.delUser = async function(id) {    
    let sql = 'DELETE FROM users WHERE id = $1 RETURNING id, email, avatar';
    let values = [id];
    let result = await pool.query(sql, values);
    return result.rows;
}

// ---------------------------------------
dbhandler.addMessage = async function(title, msg, userid) {
    let sql = 'INSERT INTO messages (id, datetime, title, message, userid) VALUES(DEFAULT, DEFAULT, $1, $2, $3) RETURNING *';
    let values = [title, msg, userid];
    let result = await pool.query(sql, values);
    return result.rows;
}

// ---------------------------------------
dbhandler.getMessages = async function() {
    let sql = 'SELECT * FROM messageview';
    let result = await pool.query(sql);
    return result.rows;
}

// ---------------------------------------
dbhandler.getMessage = async function(id) {
    let sql = 'SELECT * FROM messageview WHERE id = $1';
    let values = [id];
    let result = await pool.query(sql, values);
    return result.rows;
}

// ---------------------------------------
dbhandler.delMsg = async function(id, userid) {    
    let sql = 'DELETE FROM messages WHERE id = $1 AND userid = $2 RETURNING *';
    let values = [id, userid];
    let result = await pool.query(sql, values);
    return result.rows;
}


// export --------------------------------
module.exports = dbhandler;