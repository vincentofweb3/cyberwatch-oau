CREATE TABLE `alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`summary` text NOT NULL,
	`content` text NOT NULL,
	`severity` text NOT NULL,
	`tlp` text DEFAULT 'CLEAR' NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`created_by_id` text NOT NULL,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `alerts_slug_unique` ON `alerts` (`slug`);--> statement-breakpoint
CREATE INDEX `alerts_status_idx` ON `alerts` (`status`);--> statement-breakpoint
CREATE INDEX `alerts_published_at_idx` ON `alerts` (`published_at`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_logs_actor_idx` ON `audit_logs` (`actor_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_created_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `incident_events` (
	`id` text PRIMARY KEY NOT NULL,
	`incident_id` text NOT NULL,
	`actor_id` text,
	`event_type` text NOT NULL,
	`from_status` text,
	`to_status` text,
	`note` text,
	`visible_to_reporter` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `incident_events_incident_idx` ON `incident_events` (`incident_id`);--> statement-breakpoint
CREATE INDEX `incident_events_created_idx` ON `incident_events` (`created_at`);--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` text PRIMARY KEY NOT NULL,
	`reference_code` text NOT NULL,
	`tracking_key_hash` text NOT NULL,
	`anonymous` integer DEFAULT true NOT NULL,
	`reporter_name` text,
	`reporter_email` text,
	`reporter_phone` text,
	`category` text NOT NULL,
	`channel` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`suspicious_url` text,
	`sender_identifier` text,
	`occurred_at` integer,
	`impact` text NOT NULL,
	`severity` text NOT NULL,
	`status` text DEFAULT 'NEW' NOT NULL,
	`tlp` text DEFAULT 'AMBER' NOT NULL,
	`assigned_to_id` text,
	`acknowledged_at` integer,
	`resolved_at` integer,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`assigned_to_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `incidents_reference_unique` ON `incidents` (`reference_code`);--> statement-breakpoint
CREATE INDEX `incidents_status_idx` ON `incidents` (`status`);--> statement-breakpoint
CREATE INDEX `incidents_severity_idx` ON `incidents` (`severity`);--> statement-breakpoint
CREATE INDEX `incidents_category_idx` ON `incidents` (`category`);--> statement-breakpoint
CREATE INDEX `incidents_assignee_idx` ON `incidents` (`assigned_to_id`);--> statement-breakpoint
CREATE INDEX `incidents_created_at_idx` ON `incidents` (`created_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`last_login_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);