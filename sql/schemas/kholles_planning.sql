CREATE TABLE IF NOT EXISTS `kholle_schedule` (
   id INT AUTO_INCREMENT PRIMARY KEY,
   matiere VARCHAR(32) NOT NULL,
   `with` VARCHAR(64) NOT NULL,
   time_start DATETIME NOT NULL,
   time_end DATETIME NOT NULL,
   color_scheme VARCHAR(100) NOT NULL,
   location VARCHAR(8) NOT NULL,
    `groupe` INT NOT NULL
);