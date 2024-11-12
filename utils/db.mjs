import * as pg from "pg";
import "dotenv/config";

const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString: "postgresql://postgres:okami2539@localhost:5432/personal_blog",
});
export default connectionPool;
