CREATE DATABASE IF NOT EXISTS restauranteCaio;
USE restauranteCaio; 
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Aberto'
);

DELETE i1 FROM items i1
JOIN items i2
  ON i1.name = i2.name
 AND i1.id > i2.id;

SET @items_name_index_exists = (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'items'
      AND index_name = 'idx_items_name_unique'
);

SET @create_items_name_index = IF(
    @items_name_index_exists = 0,
    'CREATE UNIQUE INDEX idx_items_name_unique ON items (name)',
    'SELECT 1'
);

PREPARE create_items_name_index_stmt FROM @create_items_name_index;
EXECUTE create_items_name_index_stmt;
DEALLOCATE PREPARE create_items_name_index_stmt;

-- senha: admin123 (já hasheada com bcrypt)
INSERT IGNORE INTO users (username, password)
VALUES ('admin', '$2b$10$7QJzY7rY1XkJmQ5lZ6rY6uQwz9uG2mHk8lWvJ9FzZ8b1k3T9YwPqK');

INSERT IGNORE INTO items (name, category)
VALUES ('Arroz Branco', 'Base'),
       ('Feijão Preto', 'Grão');
