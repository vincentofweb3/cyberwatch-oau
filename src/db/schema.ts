import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type {
  AlertStatus,
  EventType,
  ImpactLevel,
  IncidentCategory,
  IncidentChannel,
  IncidentStatus,
  Severity,
  TlpLevel,
  UserRole,
} from "@/lib/domain";

const createdAtColumn = () =>
  timestamp("created_at", { withTimezone: true, precision: 3 }).notNull().defaultNow();

const updatedAtColumn = () =>
  timestamp("updated_at", { withTimezone: true, precision: 3 }).notNull().defaultNow();

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").$type<UserRole>().notNull(),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true, precision: 3 }),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const incidents = pgTable(
  "incidents",
  {
    id: text("id").primaryKey(),
    referenceCode: text("reference_code").notNull(),
    trackingKeyHash: text("tracking_key_hash").notNull(),
    anonymous: boolean("anonymous").notNull().default(true),
    reporterName: text("reporter_name"),
    reporterEmail: text("reporter_email"),
    reporterPhone: text("reporter_phone"),
    category: text("category").$type<IncidentCategory>().notNull(),
    channel: text("channel").$type<IncidentChannel>().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    suspiciousUrl: text("suspicious_url"),
    senderIdentifier: text("sender_identifier"),
    occurredAt: timestamp("occurred_at", { withTimezone: true, precision: 3 }),
    impact: text("impact").$type<ImpactLevel>().notNull(),
    severity: text("severity").$type<Severity>().notNull(),
    status: text("status").$type<IncidentStatus>().notNull().default("NEW"),
    tlp: text("tlp").$type<TlpLevel>().notNull().default("AMBER"),
    assignedToId: text("assigned_to_id").references(() => users.id, {
      onDelete: "set null",
    }),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true, precision: 3 }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true, precision: 3 }),
    version: integer("version").notNull().default(1),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("incidents_reference_unique").on(table.referenceCode),
    index("incidents_status_idx").on(table.status),
    index("incidents_severity_idx").on(table.severity),
    index("incidents_category_idx").on(table.category),
    index("incidents_assignee_idx").on(table.assignedToId),
    index("incidents_created_at_idx").on(table.createdAt),
  ],
);

export const incidentEvents = pgTable(
  "incident_events",
  {
    id: text("id").primaryKey(),
    incidentId: text("incident_id")
      .notNull()
      .references(() => incidents.id, { onDelete: "cascade" }),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
    eventType: text("event_type").$type<EventType>().notNull(),
    fromStatus: text("from_status").$type<IncidentStatus>(),
    toStatus: text("to_status").$type<IncidentStatus>(),
    note: text("note"),
    visibleToReporter: boolean("visible_to_reporter").notNull().default(false),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index("incident_events_incident_idx").on(table.incidentId),
    index("incident_events_created_idx").on(table.createdAt),
  ],
);

export const alerts = pgTable(
  "alerts",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    summary: text("summary").notNull(),
    content: text("content").notNull(),
    severity: text("severity").$type<Severity>().notNull(),
    tlp: text("tlp").$type<TlpLevel>().notNull().default("CLEAR"),
    status: text("status").$type<AlertStatus>().notNull().default("DRAFT"),
    createdById: text("created_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    publishedAt: timestamp("published_at", { withTimezone: true, precision: 3 }),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("alerts_slug_unique").on(table.slug),
    index("alerts_status_idx").on(table.status),
    index("alerts_published_at_idx").on(table.publishedAt),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index("audit_logs_actor_idx").on(table.actorId),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_created_idx").on(table.createdAt),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  assignedIncidents: many(incidents),
  events: many(incidentEvents),
  alerts: many(alerts),
  auditLogs: many(auditLogs),
}));

export const incidentsRelations = relations(incidents, ({ one, many }) => ({
  assignee: one(users, {
    fields: [incidents.assignedToId],
    references: [users.id],
  }),
  events: many(incidentEvents),
}));

export const incidentEventsRelations = relations(incidentEvents, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentEvents.incidentId],
    references: [incidents.id],
  }),
  actor: one(users, {
    fields: [incidentEvents.actorId],
    references: [users.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  createdBy: one(users, {
    fields: [alerts.createdById],
    references: [users.id],
  }),
}));

export const schema = {
  users,
  incidents,
  incidentEvents,
  alerts,
  auditLogs,
  usersRelations,
  incidentsRelations,
  incidentEventsRelations,
  alertsRelations,
};
