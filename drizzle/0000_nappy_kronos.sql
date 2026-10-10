CREATE TABLE `credit_ledger` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`shop_id` integer NOT NULL,
	`delta` integer NOT NULL,
	`reason` text NOT NULL,
	`stripe_event_id` text,
	`session_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`shop_id`) REFERENCES `shop`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `session`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `credit_ledger_stripe_event_id_unique` ON `credit_ledger` (`stripe_event_id`);--> statement-breakpoint
CREATE INDEX `credit_ledger_shop_id_idx` ON `credit_ledger` (`shop_id`);--> statement-breakpoint
CREATE TABLE `generation` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`attempt` integer NOT NULL,
	`adjustment_text` text,
	`status` text DEFAULT 'queued' NOT NULL,
	`spec_json` text,
	`image_path` text,
	`error` text,
	`usage_json` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`finished_at` integer,
	FOREIGN KEY (`session_id`) REFERENCES `session`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "generation_attempt_range" CHECK("generation"."attempt" between 1 and 3)
);
--> statement-breakpoint
CREATE INDEX `generation_session_idx` ON `generation` (`session_id`);--> statement-breakpoint
CREATE TABLE `photo` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`angle` text NOT NULL,
	`path` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `session`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `photo_session_angle_unique` ON `photo` (`session_id`,`angle`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`status` text DEFAULT 'capturing' NOT NULL,
	`consent_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`approved_at` integer,
	`credit_charged` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`shop_id`) REFERENCES `shop`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `session_shop_created_idx` ON `session` (`shop_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `shop` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `voice_note` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`path` text NOT NULL,
	`mime` text NOT NULL,
	`duration_s` real,
	`transcript` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `session`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `voice_note_session_idx` ON `voice_note` (`session_id`);