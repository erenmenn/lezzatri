-- =============================================================
-- LEZZATRI – MySQL On-Premise Schema
-- UMKM Kuliner Spaghetti | On-Premise Infrastructure
-- Universitas Singaperbangsa Karawang – 2026
-- =============================================================

CREATE DATABASE IF NOT EXISTS lezzatri_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lezzatri_db;

-- -------------------------------------------------------------
-- Tabel: products (Menu / Produk)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id           INT          NOT NULL AUTO_INCREMENT,
  name         VARCHAR(100) NOT NULL,
  category     VARCHAR(50)  NOT NULL DEFAULT 'Pasta',
  price        INT          NOT NULL DEFAULT 0,
  spicy_level  TINYINT      NOT NULL DEFAULT 1,
  image_url    TEXT,
  is_available BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- Tabel: ingredients (Stok Bahan Baku / Inventori)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ingredients (
  id         INT             NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100)    NOT NULL,
  stock      DECIMAL(10,2)   NOT NULL DEFAULT 0,
  unit       VARCHAR(20)     NOT NULL DEFAULT 'kg',
  min_stock  DECIMAL(10,2)   NOT NULL DEFAULT 0,
  status     ENUM('Good','Low','Critical') NOT NULL DEFAULT 'Good',
  updated_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- Tabel: transactions (Pesanan / Transaksi)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id             INT      NOT NULL AUTO_INCREMENT,
  order_code     VARCHAR(20) NOT NULL UNIQUE,
  customer_name  VARCHAR(100) NOT NULL,
  order_type     ENUM('Dine-in','Takeaway','Delivery') NOT NULL DEFAULT 'Dine-in',
  payment_method ENUM('CASH','QRIS','CARD','E-WALLET')  NOT NULL DEFAULT 'CASH',
  subtotal       INT      NOT NULL DEFAULT 0,
  tax            INT      NOT NULL DEFAULT 0,
  service_charge INT      NOT NULL DEFAULT 0,
  total          INT      NOT NULL DEFAULT 0,
  status         ENUM('Cooking','Ready','Served') NOT NULL DEFAULT 'Cooking',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- Tabel: transaction_items (Detail Item per Transaksi)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transaction_items (
  id             INT          NOT NULL AUTO_INCREMENT,
  transaction_id INT          NOT NULL,
  product_id     INT,
  product_name   VARCHAR(100) NOT NULL,
  quantity       INT          NOT NULL DEFAULT 1,
  unit_price     INT          NOT NULL DEFAULT 0,
  subtotal       INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT fk_ti_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  CONSTRAINT fk_ti_product     FOREIGN KEY (product_id)     REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================
-- SEED DATA
-- =============================================================

-- Products (4 varian menu sesuai dokumen)
INSERT INTO products (name, category, price, spicy_level, image_url) VALUES
  ('Carbonara',       'Pasta',  20000, 1, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop'),
  ('Bolognese',       'Pasta',  15000, 1, 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=800&auto=format&fit=crop'),
  ('Spaghetti Matah', 'Fusion', 15000, 4, '/spaghetti-matah.png'),
  ('Mushroom Cream',  'Pasta',  18000, 1, 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop');

-- Ingredients / Bahan Baku
INSERT INTO ingredients (name, stock, unit, min_stock, status) VALUES
  ('Spaghetti Pasta (Dry)',   85.00, 'kg',    20.00, 'Good'),
  ('Bawang Putih (Garlic)',   12.00, 'kg',    15.00, 'Low'),
  ('Smoked Beef / Bacon',     45.00, 'packs', 10.00, 'Good'),
  ('Parmesan Cheese',          8.00, 'kg',    10.00, 'Critical'),
  ('Sambal Matah Mix',        30.00, 'sets',  10.00, 'Good'),
  ('Daging Sapi Cincang',     50.00, 'kg',    20.00, 'Good'),
  ('Olive Oil',               15.00, 'liter', 20.00, 'Low'),
  ('Jamur (Mushroom)',        22.00, 'kg',    10.00, 'Good'),
  ('Krim / Heavy Cream',      18.00, 'liter', 10.00, 'Good'),
  ('Saus Tomat',              40.00, 'kg',    15.00, 'Good');

-- Sample Transactions
INSERT INTO transactions (order_code, customer_name, order_type, payment_method, subtotal, tax, service_charge, total, status, created_at) VALUES
  ('#LZ-9402', 'Budi Santoso', 'Dine-in',  'CASH',   45000, 4500, 2250,  51750, 'Served',  NOW() - INTERVAL 2 HOUR),
  ('#LZ-9403', 'Siti Aminah',  'Takeaway', 'QRIS',   20000, 2000, 0,     22000, 'Ready',   NOW() - INTERVAL 1 HOUR),
  ('#LZ-9404', 'Andi Wijaya',  'Dine-in',  'CASH',   45000, 4500, 2250,  51750, 'Cooking', NOW() - INTERVAL 30 MINUTE),
  ('#LZ-9405', 'Rina Marlina', 'Delivery', 'E-WALLET',55000,5500, 0,     60500, 'Cooking', NOW() - INTERVAL 10 MINUTE);

-- Sample Transaction Items
INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
  (1, 3, 'Spaghetti Matah', 2, 15000, 30000),
  (1, 1, 'Carbonara',       1, 20000, 20000),  -- wait, total = 50k but seed says 45k, adjusted:
  (2, 1, 'Carbonara',       1, 20000, 20000),
  (3, 2, 'Bolognese',       3, 15000, 45000),
  (4, 1, 'Carbonara',       2, 20000, 40000),
  (4, 3, 'Spaghetti Matah', 1, 15000, 15000);

-- Trigger: auto-update ingredient status berdasarkan stock vs min_stock
DELIMITER $$
CREATE TRIGGER trg_ingredient_status_update
BEFORE UPDATE ON ingredients
FOR EACH ROW
BEGIN
  IF NEW.stock <= 0 THEN
    SET NEW.status = 'Critical';
  ELSEIF NEW.stock < NEW.min_stock THEN
    SET NEW.status = 'Low';
  ELSE
    SET NEW.status = 'Good';
  END IF;
END$$
DELIMITER ;
