-- Step 1: Create the database (This should be done separately, not in a function)
CREATE DATABASE api;

-- Step 2: Connect to the new database
\connect api;

-- Step 3: Create the user if it does not exist
DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'api') THEN
            CREATE ROLE api WITH LOGIN PASSWORD '12345';
        END IF;
    END $$;

-- Step 4: Grant privileges to the user on the database
GRANT ALL PRIVILEGES ON DATABASE api TO api;

-- Step 5: Create the users table if it does not exist
CREATE TABLE IF NOT EXISTS users
(
    id         SERIAL PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    token      VARCHAR(255),
    active     BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that calls the above function on update
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Grant CRUD permissions to the api user
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO api;

-- Step 7: Insert initial data if the table is empty
INSERT INTO users (username, email, token, active)
VALUES
    ('alice', 'alice@example.com', 'token_alice', TRUE),
    ('bob', 'bob@example.com', 'token_bob', TRUE),
    ('charlie', 'charlie@example.com', 'token_charlie', TRUE)
ON CONFLICT DO NOTHING;