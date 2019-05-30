CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    
    PRIMARY KEY (id),
    foreign key (user_id) references users(id)
);

CREATE TABLE IF NOT EXISTS tagmap (
    id INT AUTO_INCREMENT,
    tag_id INT NOT NULL,
    note_id INT NOT NULL,
    
    PRIMARY KEY (id),

    foreign key (tag_id) references tags(id),
    foreign key (note_id) references notes(id)
);