import "dotenv/config";
import * as pg from "pg";

console.log(process.env.CONNECTION_STRING);

const { Pool } = pg.default;

//รอแก้ .env
const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:okami2539@localhost:5432/personal_blog",
});
export default connectionPool;
