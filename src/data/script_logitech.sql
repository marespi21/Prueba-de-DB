CREATE TABLE IF NOT EXISTS "customers" (
    "customer_id" TEXT PRIMARY KEY,
    "customer_name" TEXT,
    "customer_email" TEXT,	
    "customer_address" TEXT,
    "customer_phone" TEXT
    );


CREATE TABLE IF NOT EXISTS "products" (
	"product_sku" SERIAL NOT NULL UNIQUE,
	"product_name" VARCHAR(100) NOT NULL,
	"product_category" VARCHAR(100) NOT NULL,
	"unit_price" NUMERIC(10,2) NOT NULL,
	"insurance_id" INTEGER NOT NULL,
	PRIMARY KEY("product_sku")
);


CREATE TABLE IF NOT EXISTS "suppliers" (
	"supplier_id" SERIAL PRIMARY KEY,
	"supplier_name" TEXT,
	"supplier_email" TEXT
	);

CREATE TABLE IF NOT EXISTS "products" (
	"product_sku" TEXT PRIMARY KEY,
	"product_name" TEXT,
	"product_category" TEXT,
	"unit_price" NUMERIC,
	"supplier_email" TEXT
	);

CREATE TABLE IF NOT EXISTS "transaction" (
	"transaction_id" BIGSERIAL PRIMARY KEY,
	"date" DATE NOT NULL,
	"customer_id" TEXT REFERENCES customers(customer_email),
	"total_line_value" NUMERIC
	);
CREATE TABLE IF NOT EXISTS "transaction_details" (
	"transaction_detail_id" BIGSERIAL PRIMARY KEY,
	"transaction_id" BIGINT NOT NULL,
	"product_sku" TEXT REFERENCES products(product_sku),
	"quantity" INT,
	"supplier_id" NUMERIC
	);

CREATE INDEX IF NOT EXISTS 
idx_txn_details_txn ON "transaction_details"("transaction_id");
CREATE INDEX IF NOT EXISTS idx_txn_details_date ON "transaction_details"("date");


