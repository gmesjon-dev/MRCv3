import { sql } from 'drizzle-orm';
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const timestamps = {
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const departments = sqliteTable('departments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').notNull().default('#7c3aed'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  ...timestamps,
}, (table) => [uniqueIndex('idx_departments_name').on(table.name)]);

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  isSystem: integer('is_system', { mode: 'boolean' }).notNull().default(false),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  ...timestamps,
}, (table) => [uniqueIndex('idx_roles_name').on(table.name)]);

export const permissions = sqliteTable('permissions', {
  id: text('id').primaryKey(),
  key: text('key').notNull(),
  name: text('name').notNull(),
  module: text('module').notNull(),
  description: text('description'),
  ...timestamps,
}, (table) => [uniqueIndex('idx_permissions_key').on(table.key), index('idx_permissions_module').on(table.module)]);

export const rolePermissions = sqliteTable('role_permissions', {
  roleId: text('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: text('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  allowed: integer('allowed', { mode: 'boolean' }).notNull().default(true),
}, (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })]);

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  externalAuthId: text('external_auth_id'),
  email: text('email').notNull(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  roleId: text('role_id').notNull().references(() => roles.id),
  departmentId: text('department_id').references(() => departments.id, { onDelete: 'set null' }),
  phone: text('phone'),
  joinedAt: text('joined_at'),
  status: text('status').notNull().default('active'),
  lastSeenAt: text('last_seen_at'),
  ...timestamps,
}, (table) => [uniqueIndex('idx_users_email').on(table.email), uniqueIndex('idx_users_external_auth').on(table.externalAuthId), index('idx_users_role').on(table.roleId), index('idx_users_department').on(table.departmentId)]);

export const clientStatuses = sqliteTable('client_statuses', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  position: integer('position').notNull().default(0),
  isClosed: integer('is_closed', { mode: 'boolean' }).notNull().default(false),
  ...timestamps,
}, (table) => [uniqueIndex('idx_client_statuses_name').on(table.name)]);

export const clients = sqliteTable('clients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  company: text('company'),
  logoUrl: text('logo_url'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  instagram: text('instagram'),
  ownerId: text('owner_id').references(() => users.id, { onDelete: 'set null' }),
  statusId: text('status_id').notNull().references(() => clientStatuses.id),
  joinedAt: text('joined_at'),
  notes: text('notes'),
  ...timestamps,
}, (table) => [index('idx_clients_status').on(table.statusId), index('idx_clients_owner').on(table.ownerId), index('idx_clients_name').on(table.name)]);

export const clientModules = sqliteTable('client_modules', {
  clientId: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  moduleKey: text('module_key').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
}, (table) => [primaryKey({ columns: [table.clientId, table.moduleKey] })]);

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('active'),
  color: text('color').notNull().default('#7c3aed'),
  startsAt: text('starts_at'),
  dueAt: text('due_at'),
  createdById: text('created_by_id').notNull().references(() => users.id),
  ...timestamps,
}, (table) => [index('idx_projects_client').on(table.clientId), index('idx_projects_status').on(table.status)]);

export const taskTypes = sqliteTable('task_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  color: text('color').notNull().default('#64748b'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  ...timestamps,
}, (table) => [uniqueIndex('idx_task_types_name').on(table.name)]);

export const priorities = sqliteTable('priorities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  level: integer('level').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  ...timestamps,
}, (table) => [uniqueIndex('idx_priorities_name').on(table.name), uniqueIndex('idx_priorities_level').on(table.level)]);

export const workflows = sqliteTable('workflows', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  taskTypeId: text('task_type_id').references(() => taskTypes.id, { onDelete: 'set null' }),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  ...timestamps,
});

export const taskStatuses = sqliteTable('task_statuses', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  category: text('category').notNull().default('open'),
  position: integer('position').notNull().default(0),
  isFinal: integer('is_final', { mode: 'boolean' }).notNull().default(false),
  ...timestamps,
}, (table) => [uniqueIndex('idx_task_statuses_name').on(table.name), index('idx_task_statuses_position').on(table.position)]);

export const workflowSteps = sqliteTable('workflow_steps', {
  id: text('id').primaryKey(),
  workflowId: text('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  statusId: text('status_id').notNull().references(() => taskStatuses.id),
  position: integer('position').notNull(),
  requiresApproval: integer('requires_approval', { mode: 'boolean' }).notNull().default(false),
  allowedRoleId: text('allowed_role_id').references(() => roles.id, { onDelete: 'set null' }),
  ...timestamps,
}, (table) => [uniqueIndex('idx_workflow_step_position').on(table.workflowId, table.position), index('idx_workflow_steps_status').on(table.statusId)]);

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  clientId: text('client_id').notNull().references(() => clients.id),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  assigneeId: text('assignee_id').references(() => users.id, { onDelete: 'set null' }),
  createdById: text('created_by_id').notNull().references(() => users.id),
  taskTypeId: text('task_type_id').notNull().references(() => taskTypes.id),
  statusId: text('status_id').notNull().references(() => taskStatuses.id),
  priorityId: text('priority_id').notNull().references(() => priorities.id),
  workflowId: text('workflow_id').references(() => workflows.id, { onDelete: 'set null' }),
  category: text('category'),
  dueAt: text('due_at'),
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
  deletedAt: text('deleted_at'),
  version: integer('version').notNull().default(1),
  ...timestamps,
}, (table) => [index('idx_tasks_assignee_status').on(table.assigneeId, table.statusId), index('idx_tasks_client').on(table.clientId), index('idx_tasks_project').on(table.projectId), index('idx_tasks_due').on(table.dueAt), index('idx_tasks_status').on(table.statusId), index('idx_tasks_type').on(table.taskTypeId)]);

export const briefings = sqliteTable('briefings', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  references: text('references'),
  notes: text('notes'),
  createdById: text('created_by_id').notNull().references(() => users.id),
  ...timestamps,
}, (table) => [uniqueIndex('idx_briefings_task').on(table.taskId)]);

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => users.id),
  body: text('body').notNull(),
  parentId: text('parent_id'),
  editedAt: text('edited_at'),
  deletedAt: text('deleted_at'),
  ...timestamps,
}, (table) => [index('idx_comments_task_created').on(table.taskId, table.createdAt)]);

export const commentMentions = sqliteTable('comment_mentions', {
  commentId: text('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => [primaryKey({ columns: [table.commentId, table.userId] })]);

export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  uploadedById: text('uploaded_by_id').notNull().references(() => users.id),
  kind: text('kind').notNull(),
  name: text('name').notNull(),
  storageKey: text('storage_key'),
  url: text('url'),
  mimeType: text('mime_type'),
  sizeBytes: integer('size_bytes'),
  ...timestamps,
}, (table) => [index('idx_attachments_task').on(table.taskId)]);

export const checklists = sqliteTable('checklists', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Checklist'),
  position: integer('position').notNull().default(0),
  ...timestamps,
}, (table) => [index('idx_checklists_task').on(table.taskId)]);

export const checklistItems = sqliteTable('checklist_items', {
  id: text('id').primaryKey(),
  checklistId: text('checklist_id').notNull().references(() => checklists.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  completedById: text('completed_by_id').references(() => users.id, { onDelete: 'set null' }),
  completedAt: text('completed_at'),
  position: integer('position').notNull().default(0),
  ...timestamps,
}, (table) => [index('idx_checklist_items_checklist').on(table.checklistId, table.position)]);

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  ...timestamps,
}, (table) => [uniqueIndex('idx_tags_name').on(table.name)]);

export const taskTags = sqliteTable('task_tags', {
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => [primaryKey({ columns: [table.taskId, table.tagId] })]);

export const taskWatchers = sqliteTable('task_watchers', {
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => [primaryKey({ columns: [table.taskId, table.userId] })]);

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  readAt: text('read_at'),
  ...timestamps,
}, (table) => [index('idx_notifications_user_read').on(table.userId, table.readAt), index('idx_notifications_task').on(table.taskId)]);

export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey(),
  actorId: text('actor_id').references(() => users.id, { onDelete: 'set null' }),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  before: text('before'),
  after: text('after'),
  metadata: text('metadata'),
  ipHash: text('ip_hash'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index('idx_activity_entity_created').on(table.entityType, table.entityId, table.createdAt), index('idx_activity_actor').on(table.actorId)]);

export const customFields = sqliteTable('custom_fields', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  key: text('key').notNull(),
  fieldType: text('field_type').notNull(),
  entityType: text('entity_type').notNull(),
  options: text('options'),
  required: integer('required', { mode: 'boolean' }).notNull().default(false),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  position: integer('position').notNull().default(0),
  ...timestamps,
}, (table) => [uniqueIndex('idx_custom_fields_entity_key').on(table.entityType, table.key)]);

export const customFieldValues = sqliteTable('custom_field_values', {
  id: text('id').primaryKey(),
  customFieldId: text('custom_field_id').notNull().references(() => customFields.id, { onDelete: 'cascade' }),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  value: text('value'),
  ...timestamps,
}, (table) => [uniqueIndex('idx_custom_field_values_entity').on(table.customFieldId, table.entityType, table.entityId), index('idx_custom_field_values_lookup').on(table.entityType, table.entityId)]);

export const platformSettings = sqliteTable('platform_settings', {
  id: text('id').primaryKey().default('default'),
  platformName: text('platform_name').notNull().default('Núcleo'),
  logoUrl: text('logo_url'),
  primaryColor: text('primary_color').notNull().default('#7c3aed'),
  secondaryColor: text('secondary_color').notNull().default('#4f46e5'),
  locale: text('locale').notNull().default('pt-BR'),
  timezone: text('timezone').notNull().default('America/Sao_Paulo'),
  ...timestamps,
});

export const services = sqliteTable('services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  departmentKey: text('department_key').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdById: text('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  ...timestamps,
}, (table) => [uniqueIndex('idx_services_name').on(table.name), index('idx_services_department').on(table.departmentKey, table.active)]);

export const workEntries = sqliteTable('work_entries', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  details: text('details'),
  clientName: text('client_name'),
  serviceId: text('service_id').references(() => services.id, { onDelete: 'set null' }),
  sourceDepartment: text('source_department').notNull(),
  targetDepartment: text('target_department').notNull(),
  workDate: text('work_date').notNull(),
  status: text('status').notNull().default('pending'),
  createdById: text('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  ...timestamps,
}, (table) => [index('idx_work_entries_target_date').on(table.targetDepartment, table.workDate), index('idx_work_entries_source').on(table.sourceDepartment)]);

export const clientOperations = sqliteTable('client_operations', {
  clientId: text('client_id').primaryKey().references(() => clients.id, { onDelete: 'cascade' }),
  tier: text('tier').notNull().default('Prata'),
  analystName: text('analyst_name'),
  managerNames: text('manager_names').notNull().default('[]'),
  resultStatus: text('result_status').notNull().default('pending'),
  platforms: text('platforms').notNull().default('[]'),
  dailyBudgetCents: integer('daily_budget_cents'),
  intakeFormUrl: text('intake_form_url'),
  operationNotes: text('operation_notes'),
  googleCheckedAt: text('google_checked_at'),
  metaCheckedAt: text('meta_checked_at'),
  socialCheckedAt: text('social_checked_at'),
  updatedById: text('updated_by_id').references(() => users.id, { onDelete: 'set null' }),
  ...timestamps,
}, (table) => [index('idx_client_operations_result').on(table.resultStatus)]);

export const creativeBriefings = sqliteTable('creative_briefings', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  clientName: text('client_name').notNull(),
  format: text('format').notNull().default('Post'),
  copyText: text('copy_text').notNull(),
  visualDirections: text('visual_directions'),
  references: text('references'),
  targetDepartment: text('target_department').notNull().default('designer'),
  dueDate: text('due_date').notNull(),
  status: text('status').notNull().default('new'),
  createdById: text('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  ...timestamps,
}, (table) => [index('idx_creative_briefings_target_due').on(table.targetDepartment, table.dueDate), index('idx_creative_briefings_status').on(table.status)]);
