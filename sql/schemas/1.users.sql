CREATE TABLE IF NOT EXISTS `users` (
    id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
    first_name VARCHAR(32) NOT NULL,
    last_name VARCHAR(32) NOT NULL,
    identifiant VARCHAR(32) NOT NULL,
    password VARCHAR(128) NOT NULL,
    class VARCHAR(32),
    phone_number VARCHAR(15),
    last_post_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    `group` TINYINT,
    permission INTEGER UNSIGNED,
    FOREIGN KEY (permission) REFERENCES permissions(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
