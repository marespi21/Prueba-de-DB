import { pool } from "../config/postgres.js"
import fs from 'fs';
import csv from 'csv-parser';
import { env } from "../config/env.js";
import { AcademicTranscripts } from "../models/transcripts.js";

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

export async function migrateData() {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const customersData = []
        const suppliersData = []
        const productsData = []
        const transactionsData = []
        const transactionDetailsData = []

        fs.createReadStream(env.csvPath)
            .pipe(csv())
            .on('data', (row) => {
                customersData.push({ //.push() para añadir uno o más elementos al final de un array existente, modificando longitud  y devolviendo nuevo tamaño del array. 
                    customer_email: row.customer_email,
                    customer_name: row.customer_name,
                    customer_address: row.customer_address,
                    customer_phone: row.customer_phone
                })
                suppliersData.push({
                    supplier_email: row.supplier_email,
                    supplier_name: row.supplier_name
                })
                productsData.push({
                    product_sku: row.product_sku,
                    product_name: row.product_name,
                    product_category: row.product_category,
                    unit_price: row.unit_price,
                    supplier_email: row.supplier_email
                })
                transactionsData.push({
                    date: row.date,
                    customer_id: row.customer_email,
                    total_line_value: row.total_line_value
                })
                transactionDetailsData.push({
                    product_sku: row.product_sku,
                    quantity: row.quantity,
                    supplier_id: row.supplier_email
                })
            })
            .on('end', async () => {
                console.log('CSV file successfully processed');
                // Insert data into tables
                for (const customer of customersData) {
                    await client.query(`
                        INSERT INTO customers (customer_email, customer_name, customer_address, customer_phone)
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT (customer_email) DO NOTHING
                    `, [customer.customer_email, customer.customer_name, customer.customer_address, customer.customer_phone])
                }
                for (const supplier of suppliersData) {
                    await client.query(`
                        INSERT INTO suppliers (supplier_email, supplier_name)
                        VALUES ($1, $2)
                        ON CONFLICT (supplier_email) DO NOTHING
                    `, [supplier.supplier_email, supplier.supplier_name])
                }
                for (const product of productsData) {
                    await client.query(`
                        INSERT INTO products (product_sku, product_name, product_category, unit_price, supplier_email)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (product_sku) DO NOTHING
                    `, [product.product_sku, product.product_name, product.product_category, product.unit_price, product.supplier_email])
                }
                for (const transaction of transactionsData) {
                    const res = await client.query(`
                        INSERT INTO transaction (date, customer_id, total_line_value)
                        VALUES ($1, $2, $3)
                        RETURNING transaction_id
                    `, [transaction.date, transaction.customer_id, transaction.total_line_value])
                    const transactionId = res.rows[0].transaction_id
                    for (const detail of transactionDetailsData) {
                        await client.query(`
                            INSERT INTO transaction_details (transaction_id, product_sku, quantity, supplier_id)
                            VALUES ($1, $2, $3, $4)
                        `, [transactionId, detail.product_sku, detail.quantity, detail.supplier_id])
                    }
                }
                await client.query("COMMIT");
                console.log('Data migration completed successfully');
            })
            .on('error', (error) => {
                console.error('Error processing CSV file:', error);
                client.query("ROLLBACK");
            });
    } catch (error) {
        console.log(error);
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release()
    }
}   