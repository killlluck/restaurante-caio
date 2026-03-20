CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Aberto'
);

-- senha: admin123 (já hasheada com bcrypt)
INSERT INTO users (username, password)
VALUES ('admin', '$2b$10$7QJzY7rY1XkJmQ5lZ6rY6uQwz9uG2mHk8lWvJ9FzZ8b1k3T9YwPqK');

INSERT INTO items (name, category)
VALUES ('Arroz Branco', 'Base'),
       ('Feijão Preto', 'Grão');
