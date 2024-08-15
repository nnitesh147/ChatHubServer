import * as schema from "./schema/index.js";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import { config } from "dotenv";

config();

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
