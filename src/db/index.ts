import PG from "pg";

const Pool = PG.Pool;

export const getTaskServicePool = () => {
  return new Pool({
    user: "appHealth",
    host: "localhost",
    database: "master",
    password: "metric123",
    port: 5432
  });
}
export const getTimeSeriesPool = () => {
  return new Pool({
    user: "appHealth",
    host: "localhost",
    database: "posgres",
    password: "metric123",
    port: 5432
  });
}

