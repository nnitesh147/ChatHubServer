import { sql } from "drizzle-orm";
import { boolean } from "drizzle-orm/mysql-core";
import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  user_id: text("user_id").notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  profileCompleted: boolean("profileComplted").notNull(),
  profilePicture: text("profilePicture"),
  about: text("about"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});
