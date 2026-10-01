CREATE TABLE `card_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text DEFAULT 'local-user' NOT NULL,
	`card_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'pokemon' NOT NULL,
	`price` real DEFAULT 0 NOT NULL,
	`buy_price` real DEFAULT 0 NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`condition` text DEFAULT 'Ungraded' NOT NULL,
	`image_url` text NOT NULL,
	`notes` text,
	`added_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `community_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`author_id` text NOT NULL,
	`author_name` text NOT NULL,
	`author_avatar` text NOT NULL,
	`content` text NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `community_posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `community_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`author_name` text NOT NULL,
	`author_avatar` text NOT NULL,
	`author_handle` text NOT NULL,
	`author_badge` text,
	`is_verified` integer DEFAULT false,
	`type` text DEFAULT 'showcase' NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`image_url` text NOT NULL,
	`additional_images` text,
	`tags` text,
	`likes` integer DEFAULT 0 NOT NULL,
	`comments_count` integer DEFAULT 0 NOT NULL,
	`location` text,
	`card_info` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `market_listings` (
	`id` text PRIMARY KEY NOT NULL,
	`seller_id` text DEFAULT 'local-user' NOT NULL,
	`seller_name` text NOT NULL,
	`seller_avatar` text NOT NULL,
	`seller_rating` real DEFAULT 5 NOT NULL,
	`seller_sales_count` integer DEFAULT 0 NOT NULL,
	`contact_platform` text NOT NULL,
	`contact_value` text NOT NULL,
	`card_name` text NOT NULL,
	`category` text DEFAULT 'pokemon' NOT NULL,
	`set_name` text NOT NULL,
	`official_price` real DEFAULT 0 NOT NULL,
	`asking_price` real NOT NULL,
	`sold_price` real,
	`sold_at` text,
	`portfolio_card_id` text,
	`buy_in_cost` real,
	`condition` text NOT NULL,
	`photos` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`location` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wishlist_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text DEFAULT 'local-user' NOT NULL,
	`card_id` text NOT NULL,
	`card_name` text NOT NULL,
	`category` text DEFAULT 'pokemon' NOT NULL,
	`set_name` text NOT NULL,
	`image_url` text NOT NULL,
	`target_price` real,
	`base_market_price` real DEFAULT 0 NOT NULL,
	`notes` text,
	`added_at` text NOT NULL
);
