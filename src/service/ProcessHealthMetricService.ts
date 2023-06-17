import {Pool} from "pg";
import {HealthCheck} from "../model/HealthCheck";

export class ProcessHealthMetricService {
  pool: Pool;

  constructor() {
  }

  async fetchTasks() {
    await this.pool.connect()
    const result = await this.pool.query<HealthCheck>('SELECT * FROM "HealthCheck"')
    return result.rows
  }

  async checkAvailability() {


  }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
export const benchmark = (fn: (...args: any) => any, count: number, ...args: any) => {
  const start = performance.now();

  for (let i = 0; i < count; i++) {
    // eslint-disable-next-line prefer-spread
    fn.apply(null, args);
  }

  return performance.now() - start;
};
