CREATE TABLE `main`.`users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`delete_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
