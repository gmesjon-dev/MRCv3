CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`department_key` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_by_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_services_name` ON `services` (`name`);--> statement-breakpoint
CREATE INDEX `idx_services_department` ON `services` (`department_key`,`active`);--> statement-breakpoint
CREATE TABLE `work_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`details` text,
	`client_name` text,
	`service_id` text,
	`source_department` text NOT NULL,
	`target_department` text NOT NULL,
	`work_date` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_by_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_work_entries_target_date` ON `work_entries` (`target_department`,`work_date`);--> statement-breakpoint
CREATE INDEX `idx_work_entries_source` ON `work_entries` (`source_department`);