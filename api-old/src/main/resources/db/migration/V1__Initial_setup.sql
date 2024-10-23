-- V1__Initial_setup.sql
-- This is a SQL script that will be executed when the application starts

-- Creating the users table, if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    roles VARCHAR(50) NOT NULL,
    token VARCHAR(100) NOT NULL
);

-- Inserting some data
INSERT INTO users (username, password, roles, token) VALUES ('admin', 'adminpassword', 'ROLE_ADMIN', 'token');
INSERT INTO users (username, password, roles, token) VALUES ('userModel', 'userpassword', 'ROLE_USER', 'token');