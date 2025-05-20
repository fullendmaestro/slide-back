import type { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  text,
  jsonb,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = InferSelectModel<typeof user>;

export const album = pgTable("Album", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Album = InferSelectModel<typeof album>;

export const file = pgTable("File", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // image, video, audio
  size: integer("size").notNull(), // in bytes
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  description: text("description"),
  aiDescription: text("ai_description"),
  metadata: jsonb("metadata"), // Additional metadata like dimensions, duration, etc.
  dateTaken: timestamp("date_taken"),
  dateCreated: timestamp("date_created").defaultNow().notNull(),
  lastModified: timestamp("last_modified").defaultNow().notNull(),
  embedding: text("embedding"), // Vector embedding of the description for similarity search
  isFavorite: boolean("is_favorite").default(false).notNull(),
});

export type File = InferSelectModel<typeof file>;

export const albumFile = pgTable("AlbumFile", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  albumId: uuid("album_id")
    .notNull()
    .references(() => album.id, { onDelete: "cascade" }),
  fileId: uuid("file_id")
    .notNull()
    .references(() => file.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AlbumFile = InferSelectModel<typeof albumFile>;

// Relations
export const userRelations = relations(user, ({ many }) => ({
  albums: many(album),
  files: many(file),
}));

export const albumRelations = relations(album, ({ one, many }) => ({
  user: one(user, {
    fields: [album.userId],
    references: [user.id],
  }),
  albumFiles: many(albumFile),
}));

export const fileRelations = relations(file, ({ one, many }) => ({
  user: one(user, {
    fields: [file.userId],
    references: [user.id],
  }),
  albumFiles: many(albumFile),
}));

export const albumFileRelations = relations(albumFile, ({ one }) => ({
  album: one(album, {
    fields: [albumFile.albumId],
    references: [album.id],
  }),
  file: one(file, {
    fields: [albumFile.fileId],
    references: [file.id],
  }),
}));
