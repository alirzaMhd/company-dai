import { pgTable, uuid, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const accounts = pgTable(
  "crm_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull(),
    name: text("name").notNull(),
    domain: text("domain"),
    industry: text("industry"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({}),
);

export const contacts = pgTable(
  "crm_contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull(),
    accountId: uuid("account_id").references(() => accounts.id),
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    email: text("email"),
    phone: text("phone"),
    title: text("title"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({}),
);

export const interactions = pgTable(
  "crm_interactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull(),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id),
    accountId: uuid("account_id").references(() => accounts.id),
    type: text("type").notNull(), // call, meeting, note
    subject: text("subject").notNull(),
    content: text("content"),
    direction: text("direction"), // inbound, outbound
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    durationMinutes: integer("duration_minutes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({}),
);