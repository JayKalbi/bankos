CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    risk_tier VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO customers (id, first_name, last_name, risk_tier) VALUES ('customer_1001', 'John', 'Doe', 'LOW');