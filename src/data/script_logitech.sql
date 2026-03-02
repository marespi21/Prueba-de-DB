CREATE TABLE IF NOT EXISTS "customers" (
    "customer_email" TEXT PRIMARY KEY,
    "customer_name" TEXT,
    "customer_address" TEXT,
    "customer_phone" TEXT
    );


CREATE TABLE IF NOT EXISTS "patient" (
	"patient_id" SERIAL NOT NULL UNIQUE,
	"patient_name" VARCHAR(100) NOT NULL,
	"patient_email" VARCHAR(100) NOT NULL UNIQUE,
	"patient_phone" VARCHAR(20) NOT NULL,
	"patient_address" VARCHAR(255) NOT NULL,
	"insurance_id" INTEGER NOT NULL,
	PRIMARY KEY("patient_id")
);


CREATE TABLE IF NOT EXISTS "suppliers" (
	"supplier_email" TEXT PRIMARY KEY,
	"supplier_name" TEXT
	);

CREATE TABLE IF NOT EXISTS "products" (
	"product_sku" TEXT PRIMARY KEY,
	"product_name" TEXT,
	"product_category" TEXT,
	"unit_price" NUMERIC,
	"supplier_email" TEXT
	);

CREATE TABLE IF NOT EXISTS "transaction_lines" (
	"id" BIGSERIAL PRIMARY KEY,
	"transaction_id" TEXT NOT NULL,
	"date" DATE NOT NULL,
	"customer_email" TEXT REFERENCES customers(customer_email),
	"product_sku" TEXT REFERENCES products(product_sku),
	"quantity" INT,
	"total_line_value" NUMERIC
	);

CREATE INDEX IF NOT EXISTS 
idx_txn_lines_txn ON "transaction_lines"("transaction_id");
CREATE INDEX IF NOT EXISTS idx_txn_lines_date ON "transaction_lines"("date");


