CREATE TABLE IF NOT EXISTS "customers" (
    "customer_id" SERIAL PRIMARY KEY,
    "customer_name" TEXT,
    "customer_email" TEXT unique,	
    "customer_address" TEXT,
    "customer_phone" TEXT
    );


CREATE TABLE IF NOT EXISTS "suppliers" (
	"supplier_id" SERIAL PRIMARY KEY,
	"supplier_name" TEXT NOT NULL unique,
	"supplier_email" TEXT unique
	);

CREATE TABLE IF NOT EXISTS "products" (
	"product_sku" TEXT PRIMARY KEY,
	"product_name" TEXT NOT NULL unique,
	"product_category" TEXT,
	"unit_price" NUMERIC
	);

CREATE TABLE IF NOT EXISTS "transaction" (
	"transaction_id" BIGSERIAL PRIMARY KEY ,
	"date" DATE NOT NULL,
	"customer_id" integer REFERENCES customers(customer_id),
	"total_line_value" NUMERIC
	);

CREATE TABLE IF NOT EXISTS "transaction_details" (
	"transaction_detail_id" BIGSERIAL PRIMARY KEY,
	"transaction_id" BIGINT NOT NULL REFERENCES transaction(transaction_id),
	"product_sku" TEXT REFERENCES products(product_sku),
	"quantity" INT,
	"supplier_id" integer REFERENCES suppliers(supplier_id)
	);




