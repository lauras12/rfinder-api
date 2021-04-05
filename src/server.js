const pg = require('pg');
pg.defaults.ssl = true;

const app = require('./app')
const knex =require('knex');
const { PORT, DATABASE_URL } = require('./config');

const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})
console.log(process.env.NODE_ENV)
app.set('db', db);


app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})