DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL primary key,
    -- get rid of first and last!
    signature TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT current_timestamp
);



DROP TABLE IF EXISTS users;
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(255) NOT NULL,
    last VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)




DROP TABLE IF EXISTS user_profiles;
CREATE TABLE user_profiles (
    id SERIAL primary key,
    city VARCHAR(255) NOT NULL,
    age VARCHAR(255) NOT NULL,
    homepage VARCHAR(255) NOT NULL,
    user_id INT REFERENCES users,
    created_at TIMESTAMP DEFAULT current_timestamp
);


