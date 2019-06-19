-- Your SQL goes here
ALTER DATABASE webforget CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE notes MODIFY COLUMN title VARCHAR(255)
    CHARACTER SET utf8 COLLATE utf8_general_ci;

ALTER TABLE notes MODIFY COLUMN descr TEXT
    CHARACTER SET utf8 COLLATE utf8_general_ci;

ALTER TABLE notes MODIFY COLUMN link VARCHAR(255)
    CHARACTER SET utf8 COLLATE utf8_general_ci;