const { Client } = require('pg');

console.log(process.env.DATABASE_URL);


const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  
});

client.connect(function(err, client, done) {

	console.log("success creation of connection");
});

client.query('SELECT * FROM prim_terms WHERE term LIKE \'12\';', function(err, res){
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row.definition));
  }
  client.end();
});

