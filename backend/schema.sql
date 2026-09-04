-- -- Run this in MySQL Workbench BEFORE starting the backend, if you prefer
-- -- manual schema creation over SQLAlchemy auto-create.
-- -- (main.py will also auto-create these tables on startup if they don't exist.)

-- CREATE DATABASE IF NOT EXISTS agent_storefront
--   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- USE agent_storefront;

-- CREATE TABLE IF NOT EXISTS sessions (
--     id VARCHAR(36) PRIMARY KEY,
--     merchant_id VARCHAR(64) NOT NULL DEFAULT 'test_merchant_1',
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     txn_count INT DEFAULT 0
-- );

-- CREATE TABLE IF NOT EXISTS audit_log (
--     id VARCHAR(36) PRIMARY KEY,
--     session_id VARCHAR(36) NOT NULL,
--     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
--     action_type VARCHAR(64) NOT NULL,
--     proposed_params_json TEXT,
--     agent_reasoning_text TEXT,
--     policy_check_result VARCHAR(32) NOT NULL,
--     razorpay_call_made BOOLEAN DEFAULT FALSE,
--     razorpay_response_json TEXT,
--     final_status VARCHAR(32) DEFAULT 'pending',
--     FOREIGN KEY (session_id) REFERENCES sessions(id)
-- );

-- CREATE TABLE IF NOT EXISTS orders (
--     id VARCHAR(36) PRIMARY KEY,
--     session_id VARCHAR(36) NOT NULL,
--     razorpay_order_id VARCHAR(64),
--     razorpay_payment_link_id VARCHAR(64),
--     amount_inr FLOAT NOT NULL,
--     items_json TEXT,
--     status VARCHAR(32) DEFAULT 'created',
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (session_id) REFERENCES sessions(id)
-- );

-- CREATE TABLE IF NOT EXISTS catalog_items (
--     sku VARCHAR(32) PRIMARY KEY,
--     name VARCHAR(128) NOT NULL,
--     category VARCHAR(64) NOT NULL,
--     price_inr FLOAT NOT NULL,
--     stock INT DEFAULT 0,
--     cross_sell_sku VARCHAR(32)
-- );
-- CREATE TABLE IF NOT EXISTS users (
--     id VARCHAR(36) PRIMARY KEY,
--     name VARCHAR(128) NOT NULL,
--     email VARCHAR(255) NOT NULL UNIQUE,
--     password_hash VARCHAR(255) NOT NULL,
--     role VARCHAR(16) NOT NULL,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE IF NOT EXISTS sessions (
--     id VARCHAR(36) PRIMARY KEY,
--     merchant_id VARCHAR(64) NOT NULL DEFAULT 'test_merchant_1',
--     user_id VARCHAR(36) NULL,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     txn_count INT DEFAULT 0,
--     FOREIGN KEY (user_id) REFERENCES users(id)
-- );
-- -- Sample catalog seed (also inserted by db/seed.py — either works)
-- INSERT IGNORE INTO catalog_items (sku, name, category, price_inr, stock, cross_sell_sku) VALUES
-- ('HOOD-BLU-M', 'Blue Hoodie - M', 'apparel', 1499, 25, 'CAP-BLK'),
-- ('HOOD-BLU-L', 'Blue Hoodie - L', 'apparel', 1499, 18, 'CAP-BLK'),
-- ('TEE-WHT-M',  'White T-Shirt - M', 'apparel', 599, 40, 'BELT-BRN'),
-- ('CAP-BLK',    'Black Cap', 'accessories', 349, 60, NULL),
-- ('BELT-BRN',   'Brown Leather Belt', 'accessories', 799, 15, NULL);



-- Run this in MySQL Workbench BEFORE starting the backend, if you prefer
-- manual schema creation over SQLAlchemy auto-create.
-- (main.py will also auto-create these tables on startup if they don't exist.)

CREATE DATABASE IF NOT EXISTS agent_storefront
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE agent_storefront;

CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(36) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL DEFAULT 'test_merchant_1',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    txn_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS audit_log (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    action_type VARCHAR(64) NOT NULL,
    proposed_params_json TEXT,
    agent_reasoning_text TEXT,
    policy_check_result VARCHAR(32) NOT NULL,
    razorpay_call_made BOOLEAN DEFAULT FALSE,
    razorpay_response_json TEXT,
    final_status VARCHAR(32) DEFAULT 'pending',
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36),
    razorpay_order_id VARCHAR(64),
    razorpay_payment_link_id VARCHAR(64),
    amount_inr FLOAT NOT NULL,
    items_json TEXT,
    status VARCHAR(32) DEFAULT 'created',
    -- Set TRUE the one time stock is decremented for this order (on
    -- confirmed payment only). Prevents double-decrementing stock across
    -- webhook retries / live-verification polling for the same order.
    stock_decremented BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Idempotency ledger for inbound Razorpay webhook deliveries — see
-- routers/webhook.py. A duplicate delivery of the same event (same id,
-- or same body hash if Razorpay doesn't send an explicit event id) is
-- recognized here and skipped before it can touch orders/stock/audit.
CREATE TABLE IF NOT EXISTS webhook_events (
    id VARCHAR(128) PRIMARY KEY,
    event_type VARCHAR(64),
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS catalog_items (
    sku VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    price_inr FLOAT NOT NULL,
    stock INT DEFAULT 0,
    cross_sell_sku VARCHAR(32)
);
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(16) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(36) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL DEFAULT 'test_merchant_1',
    user_id VARCHAR(36) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    txn_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
-- Sample catalog seed (also inserted by db/seed.py — either works)
INSERT IGNORE INTO catalog_items (sku, name, category, price_inr, stock, cross_sell_sku) VALUES
('HOOD-BLU-M', 'Blue Hoodie - M', 'apparel', 1499, 25, 'CAP-BLK'),
('HOOD-BLU-L', 'Blue Hoodie - L', 'apparel', 1499, 18, 'CAP-BLK'),
('TEE-WHT-M',  'White T-Shirt - M', 'apparel', 599, 40, 'BELT-BRN'),
('CAP-BLK',    'Black Cap', 'accessories', 349, 60, NULL),
('BELT-BRN',   'Brown Leather Belt', 'accessories', 799, 15, NULL);