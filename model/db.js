let sql = require('mysql');

let db = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'tn156bm48@',
    database: 'data'
})

db.connect((e)=>{
    if(e) throw e;
    console.log('DB성공')
})

module.exports = db;