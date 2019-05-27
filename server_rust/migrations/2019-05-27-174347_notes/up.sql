CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL,

    PRIMARY KEY (id),
    
    foreign key (user_id) references users(id)
);