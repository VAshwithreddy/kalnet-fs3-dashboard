-- CREATE DATABASE myproject;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

USE myproject;
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50)
);
INSERT INTO roles (role_name) VALUES ('Admin');
INSERT INTO roles (role_name) VALUES ('User');
INSERT INTO roles (role_name) VALUES ('Manager');
SELECT * FROM roles;
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50),
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);
INSERT INTO users (username, role_id) VALUES ('John', 1);
INSERT INTO users (username, role_id) VALUES ('Alice', 2);
INSERT INTO users (username, role_id) VALUES ('David', 3);
SELECT * FROM users;
SELECT users.username, roles.role_name
FROM users
JOIN roles ON users.role_id = roles.role_id;
UPDATE users 
SET username = 'John Updated'
WHERE user_id = 1;
SELECT * FROM users;
DELETE FROM users 
WHERE user_id = 3;
SELECT * FROM users;
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actorId INT,
    action VARCHAR(255),
    targetId INT,
    targetType VARCHAR(100),
    metadata JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_createdAt
ON audit_log(createdAt);
CREATE INDEX idx_role_id
ON users(role_id);
SHOW INDEX FROM users;
EXPLAIN SELECT users.username, roles.role_name
FROM users
JOIN roles ON users.role_id = roles.role_id;
EXPLAIN SELECT users.username, roles.role_name
FROM users
JOIN roles ON users.role_id = roles.role_id;
SELECT role_id, COUNT(*) AS total_users
FROM users
GROUP BY role_id;
SELECT roles.role_name, COUNT(users.user_id) AS total_users
FROM roles
LEFT JOIN users
ON roles.role_id = users.role_id
GROUP BY roles.role_name;
ALTER TABLE roles
ADD COLUMN permissions JSON;
SELECT * FROM roles;
UPDATE roles
SET permissions = '["all"]'
WHERE role_id = 1;
UPDATE roles
SET permissions = '["read:portal"]'
WHERE role_id = 2;
UPDATE roles
SET permissions = '["manage_users"]'
WHERE role_id = 3;
INSERT INTO roles (role_name, permissions)
VALUES
('Teacher', '["read","write"]'),
('Staff', '["view_reports"]');
SELECT * FROM roles;
SELECT users.username, roles.role_name, roles.permissions
FROM users
JOIN roles
ON users.role_id = roles.role_id;
ALTER TABLE audit_log
ADD COLUMN status VARCHAR(50);
CREATE INDEX idx_status
ON audit_log(status);
SHOW INDEX FROM audit_log;
SHOW INDEX FROM users;
ALTER TABLE users
ADD COLUMN status VARCHAR(20);
CREATE INDEX idx_status
ON users(status);
SHOW INDEX FROM users;
SELECT 
roles.role_name,
COUNT(users.user_id) AS total_users
FROM roles
LEFT JOIN users
ON roles.role_id = users.role_id
GROUP BY roles.role_name;