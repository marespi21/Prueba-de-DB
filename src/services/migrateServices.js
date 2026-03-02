import { pool } from "../config/postgres.js"
import fs from 'fs';
import csv from 'csv-parser';
import { env } from "../config/env.js";
import { AcademicTranscripts } from "../models/transcripts.js";

export async function queryTables() {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        //create table 
        await client.query(`
        CREATE TABLE IF NOT EXISTS "customers" (
    "customer_email" TEXT PRIMARY KEY,
    "customer_name" TEXT,
    "customer_address" TEXT,
    "customer_phone" TEXT
    );
            `)

        //create table suppliers
        await client.query(`
        CREATE TABLE IF NOT EXISTS "suppliers" (
    "supplier_email" TEXT PRIMARY KEY,
    "supplier_name" TEXT
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


        //create table transaction lines
        await client.query(`
        CREATE TABLE IF NOT EXISTS "transaction_lines" (
    "transaction_id" SERIAL PRIMARY KEY,
    "customer_email" TEXT,
    "product_sku" TEXT,
    "quantity" INTEGER,
    "date" DATE
);
            `)

        //create indexes    

        await client.query(`
    CREATE INDEX IF NOT EXISTS "idx_txn_lines_txn" ON "transaction_lines"("transaction_id");
    CREATE INDEX IF NOT EXISTS "idx_txn_lines_date" ON "transaction_lines"("date");
    CREATE INDEX IF NOT EXISTS "idx_txn_lines_product" ON "transaction_lines"("product_sku"); `)
);
            `)

        await client.query("COMMIT");
        return { rows: rows.length, customersUpserted, suppliersUpserted, productsUpserted, linesInserted };
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
}
