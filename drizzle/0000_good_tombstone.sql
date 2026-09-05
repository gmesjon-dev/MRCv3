CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`action` text NOT NULL,
	`before` text,
	`after` text,
	`metadata` text,
	`ip_hash` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_activity_entity_created` ON `activity_logs` (`entity_type`,`entity_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_activity_actor` ON `activity_logs` (`actor_id`);--> statement-breakpoint
CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`uploaded_by_id` text NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`storage_key` text,
	`url` text,
	`mime_type` text,
	`size_bytes` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_attachments_task` ON `attachments` (`task_id`);--> statement-breakpoint
CREATE TABLE `briefings` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`references` text,
	`notes` text,
	`created_by_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_briefings_task` ON `briefings` (`task_id`);--> statement-breakpoint
CREATE TABLE `checklist_items` (
	`id` text PRIMARY KEY NOT NULL,
	`checklist_id` text NOT NULL,
	`title` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`completed_by_id` text,
	`completed_at` text,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`checklist_id`) REFERENCES `checklists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`completed_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_checklist_items_checklist` ON `checklist_items` (`checklist_id`,`position`);--> statement-breakpoint
CREATE TABLE `checklists` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`title` text DEFAULT 'Checklist' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_checklists_task` ON `checklists` (`task_id`);--> statement-breakpoint
CREATE TABLE `client_modules` (
	`client_id` text NOT NULL,
	`module_key` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	PRIMARY KEY(`client_id`, `module_key`),
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `client_statuses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`is_closed` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_client_statuses_name` ON `client_statuses` (`name`);--> statement-breakpoint
CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`company` text,
	`logo_url` text,
	`phone` text,
	`email` text,
	`website` text,
	`instagram` text,
	`owner_id` text,
	`status_id` text NOT NULL,
	`joined_at` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`status_id`) REFERENCES `client_statuses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_clients_status` ON `clients` (`status_id`);--> statement-breakpoint
CREATE INDEX `idx_clients_owner` ON `clients` (`owner_id`);--> statement-breakpoint
CREATE INDEX `idx_clients_name` ON `clients` (`name`);--> statement-breakpoint
CREATE TABLE `comment_mentions` (
	`comment_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`comment_id`, `user_id`),
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`author_id` text NOT NULL,
	`body` text NOT NULL,
	`parent_id` text,
	`edited_at` text,
	`deleted_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_comments_task_created` ON `comments` (`task_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `custom_field_values` (
	`id` text PRIMARY KEY NOT NULL,
	`custom_field_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`value` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`custom_field_id`) REFERENCES `custom_fields`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_custom_field_values_entity` ON `custom_field_values` (`custom_field_id`,`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `idx_custom_field_values_lookup` ON `custom_field_values` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `custom_fields` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`key` text NOT NULL,
	`field_type` text NOT NULL,
	`entity_type` text NOT NULL,
	`options` text,
	`required` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_custom_fields_entity_key` ON `custom_fields` (`entity_type`,`key`);--> statement-breakpoint
CREATE TABLE `departments` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text DEFAULT '#7c3aed' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_departments_name` ON `departments` (`name`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`task_id` text,
	`read_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_notifications_user_read` ON `notifications` (`user_id`,`read_at`);--> statement-breakpoint
CREATE INDEX `idx_notifications_task` ON `notifications` (`task_id`);--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`module` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_permissions_key` ON `permissions` (`key`);--> statement-breakpoint
CREATE INDEX `idx_permissions_module` ON `permissions` (`module`);--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`platform_name` text DEFAULT 'Núcleo' NOT NULL,
	`logo_url` text,
	`primary_color` text DEFAULT '#7c3aed' NOT NULL,
	`secondary_color` text DEFAULT '#4f46e5' NOT NULL,
	`locale` text DEFAULT 'pt-BR' NOT NULL,
	`timezone` text DEFAULT 'America/Sao_Paulo' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `priorities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`level` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_priorities_name` ON `priorities` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_priorities_level` ON `priorities` (`level`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`color` text DEFAULT '#7c3aed' NOT NULL,
	`starts_at` text,
	`due_at` text,
	`created_by_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_projects_client` ON `projects` (`client_id`);--> statement-breakpoint
CREATE INDEX `idx_projects_status` ON `projects` (`status`);--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	`allowed` integer DEFAULT true NOT NULL,
	PRIMARY KEY(`role_id`, `permission_id`),
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_system` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_roles_name` ON `roles` (`name`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_tags_name` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `task_statuses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`category` text DEFAULT 'open' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`is_final` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_task_statuses_name` ON `task_statuses` (`name`);--> statement-breakpoint
CREATE INDEX `idx_task_statuses_position` ON `task_statuses` (`position`);--> statement-breakpoint
CREATE TABLE `task_tags` (
	`task_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`task_id`, `tag_id`),
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `task_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text,
	`color` text DEFAULT '#64748b' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_task_types_name` ON `task_types` (`name`);--> statement-breakpoint
CREATE TABLE `task_watchers` (
	`task_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`task_id`, `user_id`),
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`client_id` text NOT NULL,
	`project_id` text,
	`assignee_id` text,
	`created_by_id` text NOT NULL,
	`task_type_id` text NOT NULL,
	`status_id` text NOT NULL,
	`priority_id` text NOT NULL,
	`workflow_id` text,
	`category` text,
	`due_at` text,
	`started_at` text,
	`completed_at` text,
	`deleted_at` text,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_type_id`) REFERENCES `task_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`status_id`) REFERENCES `task_statuses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`priority_id`) REFERENCES `priorities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_assignee_status` ON `tasks` (`assignee_id`,`status_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_client` ON `tasks` (`client_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_project` ON `tasks` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_due` ON `tasks` (`due_at`);--> statement-breakpoint
CREATE INDEX `idx_tasks_status` ON `tasks` (`status_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_type` ON `tasks` (`task_type_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`external_auth_id` text,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text,
	`role_id` text NOT NULL,
	`department_id` text,
	`phone` text,
	`joined_at` text,
	`status` text DEFAULT 'active' NOT NULL,
	`last_seen_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_external_auth` ON `users` (`external_auth_id`);--> statement-breakpoint
CREATE INDEX `idx_users_role` ON `users` (`role_id`);--> statement-breakpoint
CREATE INDEX `idx_users_department` ON `users` (`department_id`);--> statement-breakpoint
CREATE TABLE `workflow_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`workflow_id` text NOT NULL,
	`status_id` text NOT NULL,
	`position` integer NOT NULL,
	`requires_approval` integer DEFAULT false NOT NULL,
	`allowed_role_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`status_id`) REFERENCES `task_statuses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`allowed_role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_workflow_step_position` ON `workflow_steps` (`workflow_id`,`position`);--> statement-breakpoint
CREATE INDEX `idx_workflow_steps_status` ON `workflow_steps` (`status_id`);--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`task_type_id` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`task_type_id`) REFERENCES `task_types`(`id`) ON UPDATE no action ON DELETE set null
);
