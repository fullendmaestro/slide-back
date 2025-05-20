import "server-only";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { user, type User } from "./schema";
import { generateHashedPassword } from "./utils";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(
  email: string,
  password: string,
  name?: string
) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db
      .insert(user)
      .values({ email, password: hashedPassword, name });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; image?: string }
) {
  try {
    return await db.update(user).set(data).where(eq(user.id, userId));
  } catch (error) {
    console.error("Failed to update user profile");
    throw error;
  }
}

export async function getUserById(userId: string): Promise<User | undefined> {
  try {
    const users = await db.select().from(user).where(eq(user.id, userId));
    return users[0];
  } catch (error) {
    console.error("Failed to get user by ID");
    throw error;
  }
}
