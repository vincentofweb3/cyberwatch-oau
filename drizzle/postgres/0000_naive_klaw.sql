CREATE TABLE "alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text NOT NULL,
	"content" text NOT NULL,
	"severity" text NOT NULL,
	"tlp" text DEFAULT 'CLEAR' NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"created_by_id" text NOT NULL,
	"published_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incident_events" (
	"id" text PRIMARY KEY NOT NULL,
	"incident_id" text NOT NULL,
	"actor_id" text,
	"event_type" text NOT NULL,
	"from_status" text,
	"to_status" text,
	"note" text,
	"visible_to_reporter" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" text PRIMARY KEY NOT NULL,
	"reference_code" text NOT NULL,
	"tracking_key_hash" text NOT NULL,
	"anonymous" boolean DEFAULT true NOT NULL,
	"reporter_name" text,
	"reporter_email" text,
	"reporter_phone" text,
	"category" text NOT NULL,
	"channel" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"suspicious_url" text,
	"sender_identifier" text,
	"occurred_at" timestamp (3) with time zone,
	"impact" text NOT NULL,
	"severity" text NOT NULL,
	"status" text DEFAULT 'NEW' NOT NULL,
	"tlp" text DEFAULT 'AMBER' NOT NULL,
	"assigned_to_id" text,
	"acknowledged_at" timestamp (3) with time zone,
	"resolved_at" timestamp (3) with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_events" ADD CONSTRAINT "incident_events_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_events" ADD CONSTRAINT "incident_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "alerts_slug_unique" ON "alerts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "alerts_status_idx" ON "alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "alerts_published_at_idx" ON "alerts" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "incident_events_incident_idx" ON "incident_events" USING btree ("incident_id");--> statement-breakpoint
CREATE INDEX "incident_events_created_idx" ON "incident_events" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "incidents_reference_unique" ON "incidents" USING btree ("reference_code");--> statement-breakpoint
CREATE INDEX "incidents_status_idx" ON "incidents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "incidents_severity_idx" ON "incidents" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "incidents_category_idx" ON "incidents" USING btree ("category");--> statement-breakpoint
CREATE INDEX "incidents_assignee_idx" ON "incidents" USING btree ("assigned_to_id");--> statement-breakpoint
CREATE INDEX "incidents_created_at_idx" ON "incidents" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");