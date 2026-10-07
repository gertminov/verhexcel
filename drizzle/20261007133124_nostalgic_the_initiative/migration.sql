CREATE TABLE `absences` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`date` text NOT NULL,
	`type` text NOT NULL,
	CONSTRAINT `fk_absences_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `absences_user_id_date_unique` UNIQUE(`user_id`,`date`)
);
