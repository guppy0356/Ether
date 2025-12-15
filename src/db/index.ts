import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

import env from "../../src/env"

const connectionString = env.DATABASE_URL;

export const createDb = () => {
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
};
