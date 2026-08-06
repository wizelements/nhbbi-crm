CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'visitor' NOT NULL,
	`first_name` text,
	`last_name` text,
	`phone` text,
	`email_verified` integer DEFAULT false,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);
--
CREATE TABLE `memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`tier` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`square_subscription_id` text,
	`square_order_id` text,
	`price_cents` integer NOT NULL,
	`starts_at` integer,
	`expires_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--
CREATE TABLE `member_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`company_name` text,
	`website` text,
	`phone` text,
	`bio` text,
	`logo_url` text,
	`category` text,
	`approved` integer DEFAULT false,
	`featured` integer DEFAULT false,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--
CREATE UNIQUE INDEX `member_profiles_user_id_idx` ON `member_profiles` (`user_id`);
--
CREATE TABLE `directory_listings` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`company_name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`contact_email` text,
	`contact_phone` text,
	`website` text,
	`logo_url` text,
	`approved` integer DEFAULT false,
	`featured` integer DEFAULT false,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--
CREATE UNIQUE INDEX `directory_listings_slug_idx` ON `directory_listings` (`slug`);
--
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`location` text,
	`start_at` integer NOT NULL,
	`end_at` integer,
	`price_cents` integer DEFAULT 0 NOT NULL,
	`square_item_id` text,
	`published` integer DEFAULT false,
	`capacity` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--
CREATE UNIQUE INDEX `events_slug_idx` ON `events` (`slug`);
--
CREATE TABLE `event_registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'registered' NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`square_order_id` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`company_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`location` text,
	`contact_email` text NOT NULL,
	`published` integer DEFAULT false,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `directory_listings`(`id`) ON UPDATE no action ON DELETE set null
);
--
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`type` text NOT NULL,
	`square_order_id` text NOT NULL,
	`total_cents` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--
CREATE UNIQUE INDEX `orders_square_order_id_idx` ON `orders` (`square_order_id`);
--
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`interest` text,
	`message` text,
	`source` text DEFAULT 'website',
	`assigned_to` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--
CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_type` text NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--
CREATE TABLE `ai_agent_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text NOT NULL,
	`session_key` text NOT NULL,
	`intent` text,
	`actions` text,
	`result` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
