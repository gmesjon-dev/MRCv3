CREATE TABLE `client_operations` (
	`client_id` text PRIMARY KEY NOT NULL,
	`tier` text DEFAULT 'Prata' NOT NULL,
	`analyst_name` text,
	`manager_names` text DEFAULT '[]' NOT NULL,
	`result_status` text DEFAULT 'pending' NOT NULL,
	`platforms` text DEFAULT '[]' NOT NULL,
	`daily_budget_cents` integer,
	`intake_form_url` text,
	`operation_notes` text,
	`google_checked_at` text,
	`meta_checked_at` text,
	`social_checked_at` text,
	`updated_by_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`updated_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_client_operations_result` ON `client_operations` (`result_status`);--> statement-breakpoint
CREATE TABLE `creative_briefings` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`client_name` text NOT NULL,
	`format` text DEFAULT 'Post' NOT NULL,
	`copy_text` text NOT NULL,
	`visual_directions` text,
	`references` text,
	`target_department` text DEFAULT 'designer' NOT NULL,
	`due_date` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_by_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_creative_briefings_target_due` ON `creative_briefings` (`target_department`,`due_date`);--> statement-breakpoint
CREATE INDEX `idx_creative_briefings_status` ON `creative_briefings` (`status`);