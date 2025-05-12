import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema"; // Import the schema
import postgres from "postgres";

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);

// Pass the schema to the drizzle function
export const db = drizzle(client, { schema });

// Export schema tables for direct use
export const { albumFile, album, file, user } = schema;
