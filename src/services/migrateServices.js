import { pool } from "../config/postgres.js"
import { parse}  from 'csv-parse/sync';
import { env } from "../config/env.js";
import { resolve } from "path";
import { readFile } from "fs/promises";
import { migration } from "../config/postgres.js";

export async function queryTables() {
    const client = await pool.connect()
    try {
        await client.query('BEGIN') //.query Devuelve el primer elemento del documento

        //create table customers
        await client.query(`
        CREATE TABLE IF NOT EXISTS "customers" (
    "customer_id" TEXT PRIMARY KEY, 
    "customer_name" TEXT,
    "customer_email" TEXT,
    "customer_address" TEXT,
    "customer_phone" TEXT
    );
            `)

        //create table suppliers
        await client.query(`
        CREATE TABLE IF NOT EXISTS "suppliers" (
	"supplier_id" SERIAL PRIMARY KEY,
	"supplier_name" TEXT,
	"supplier_email" TEXT
	);
                `)

        //create table products
        await client.query(`    
        CREATE TABLE IF NOT EXISTS "products" (
    "product_sku" TEXT PRIMARY KEY,
    "product_name" TEXT,
    "product_category" TEXT,
    "unit_price" NUMERIC,
    "supplier_email" TEXT
);
            `)

        //create table transaction
        await client.query(`
        CREATE TABLE IF NOT EXISTS "transaction" (
	"transaction_id" BIGSERIAL PRIMARY KEY,
	"date" DATE NOT NULL,
	"customer_id" TEXT REFERENCES customers(customer_email),
	"total_line_value" NUMERIC
	);
            `)
        //create table transaction details
        await client.query(`
        CREATE TABLE IF NOT EXISTS "transaction_details" (
	"transaction_detail_id" BIGSERIAL PRIMARY KEY,
	"transaction_id" BIGINT NOT NULL,
	"product_sku" TEXT REFERENCES products(product_sku),
	"quantity" INT,
	"supplier_id" NUMERIC
);
            `)

        //create indexes    

        await client.query(`
    CREATE INDEX IF NOT EXISTS "idx_txn_lines_txn" ON "transaction_lines"("transaction_id");
    CREATE INDEX IF NOT EXISTS "idx_txn_details_txn" ON "transaction_details"("transaction_id");
    CREATE INDEX IF NOT EXISTS "idx_txn_details_date" ON "transaction_details"("date");
    CREATE INDEX IF NOT EXISTS "idx_txn_details_product" ON "transaction_details"("product_sku"); 
            
            `)
        
        await client.query("COMMIT");
    return { rows: rows.length, customersUpserted, suppliersUpserted, productsUpserted, linesInserted };
} catch (error) {
    console.log(error);
    await client.query("ROLLBACK");
    throw error;
} finally {
    client.release()
}
}

export async function migration(clearBefore = false) {
    const client = await pool.connect()

    try {
        console.log('Starting migration process...');

        const csv = await readFile(resolve.fileDataCsv, "utf-8");

        const rows = parse(csv, {
            columns: true,
            trim: true,
            skip_empty_lines: true
        });

        let customersUpserted = 0;
        let suppliersUpserted = 0;
        let productsUpserted = 0;
        let linesInserted = 0;

        for (const row of rows) {
            const { customer_id, customer_name, customer_email, customer_address, customer_phone, supplier_name, supplier_email, product_sku, product_name, product_category, unit_price, date, quantity } = row;

            // Upsert customer
            await client.query(`
                INSERT INTO customers (customer_id, customer_name, customer_email, customer_address, customer_phone)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (customer_id) DO UPDATE SET
                    customer_name = EXCLUDED.customer_name,
                    customer_email = EXCLUDED.customer_email,
                    customer_address = EXCLUDED.customer_address,
                    customer_phone = EXCLUDED.customer_phone;
            `, [customer_id, customer_name, customer_email, customer_address, customer_phone]);
            customersUpserted++;

            // Upsert supplier
            await client.query(`
                INSERT INTO suppliers (supplier_name, supplier_email)
                VALUES ($1, $2)
                ON CONFLICT (supplier_email) DO UPDATE SET
                    supplier_name = EXCLUDED.supplier_name;
            `, [supplier_name, supplier_email]);
            suppliersUpserted++;

            // Upsert product
            await client.query(`
                INSERT INTO products (product_sku, product_name, product_category, unit_price, supplier_email)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (product_sku) DO UPDATE SET
                    product_name = EXCLUDED.product_name,
                    product_category = EXCLUDED.product_category,
                    unit_price = EXCLUDED.unit_price,
                    supplier_email = EXCLUDED.supplier_email;
            `, [product_sku, product_name, product_category, unit_price, supplier_email]);
            productsUpserted++;

            // Insert transaction and transaction details
            const transactionResult = await client.query(`
                INSERT INTO transaction (date, customer_id, total_line_value)
                VALUES ($1, $2, $3)
                RETURNING transaction_id;
            `, [date, customer_email, unit_price * quantity]);
            const transactionId = transactionResult.rows[0].transaction_id;

            await client.query(`
                INSERT INTO transaction_details (transaction_id, product_sku, quantity, supplier_id)
                VALUES ($1, $2, $3, (SELECT supplier_id FROM suppliers WHERE supplier_email = $4));
            `, [transactionId, product_sku, quantity, supplier_email]);
            linesInserted++;
        }

        console.log('Migration completed successfully.');
        return { rows: rows.length, customersUpserted, suppliersUpserted, productsUpserted, linesInserted };    

    

  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  } finally {
    client.release();
  }
}