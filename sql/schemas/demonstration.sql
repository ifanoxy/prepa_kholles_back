CREATE TABLE IF NOT EXISTS `demonstration` (
    id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
    name VARCHAR(128) NOT NULL,
    week INT NOT NULL,
    pdf MEDIUMBLOB,
    author_id INTEGER UNSIGNED,
    FOREIGN KEY (author_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)