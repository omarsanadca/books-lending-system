import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "sanad",
  database: "node_js",
  password: "password",
});

export default pool;