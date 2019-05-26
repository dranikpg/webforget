CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT,
    nick VARCHAR(255) NOT NULL,
    pw VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    PRIMARY KEY (id)
);