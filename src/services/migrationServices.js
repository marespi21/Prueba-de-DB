import { pool } from "../config/postgres.js";
import { parse } from "csv-parse/sync";
import { env } from "../config/env.js";
import { resolve } from "path";
import { readFile } from "fs/promises";

/* CREACIÓN DE TABLAS */



/* MIGRACIÓN DEL CSV */

export async function migration(clearBefore = false) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        console.log("Starting migration process...");

        const csvFile = await readFile(resolve(env.fileDataCsv), "utf-8");

        const rows = parse(csvFile, {
            columns: true,
            trim: true,
            skip_empty_lines: true
        });

        

        let customersUpserted = 0;
        let suppliersUpserted = 0;
        let productsUpserted = 0;
        let linesInserted = 0;

        for (const row of rows) {

            const {
                customer_id,
                customer_name,
                customer_email,
                customer_address,
                customer_phone,
                supplier_name,
                supplier_email,
                product_sku,
                product_name,
                product_category,
                unit_price,
                date,
                quantity
            } = row;

            /* -------------------------
               CUSTOMER */
               const customerResult = await client.query(`SeleCT * FROM customers WHERE customer_email = $1`, [customer_email]);
               
            /* if (!customerResult.rows.length) { */

                const customer = await client.query(`
                    INSERT INTO customers 
                    (customer_name, customer_email, customer_address, customer_phone)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (customer_email) DO UPDATE SET
                    customer_name = EXCLUDED.customer_name,
                    customer_email = EXCLUDED.customer_email,
                    customer_address = EXCLUDED.customer_address,
                    customer_phone = EXCLUDED.customer_phone
                    returning customer_id;
                    `, [customer_name, customer_email, customer_address, customer_phone]);
                    
                    customersUpserted++;
               /*  }   */ 
               

            /* SUPPLIER */
            await client.query(`
                INSERT INTO suppliers (supplier_name, supplier_email)
                VALUES ($1, $2)
                ON CONFLICT (supplier_email) DO UPDATE SET
                    supplier_name = EXCLUDED.supplier_name;
            `, [supplier_name, supplier_email]);

            suppliersUpserted++;

            // Obtener supplier_id
            const supplierResult = await client.query(`
                SELECT supplier_id FROM suppliers WHERE supplier_email = $1
            `, [supplier_email]);

            const supplierId = supplierResult.rows[0].supplier_id;

            /* PRODUCT */
            await client.query(`
                INSERT INTO products 
                (product_sku, product_name, product_category, unit_price, supplier_id)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (product_sku) DO UPDATE SET
                    product_name = EXCLUDED.product_name,
                    product_category = EXCLUDED.product_category,
                    unit_price = EXCLUDED.unit_price,
                    supplier_id = EXCLUDED.supplier_id;
            `, [product_sku, product_name, product_category, unit_price, supplierId]);

            productsUpserted++;

            /* TRANSACTION */
            const transactionResult = await client.query(`
                INSERT INTO transaction (date, customer_id, total_line_value)
                VALUES ($1, $2, $3)
                RETURNING transaction_id;
            `, [date, customer.rows[0].customer_id, unit_price * quantity]);

            const transactionId = transactionResult.rows[0].transaction_id;

            /* TRANSACTION DETAILS */
            await client.query(`
                INSERT INTO transaction_details 
                (transaction_id, product_sku, quantity)
                VALUES ($1, $2, $3);
            `, [transactionId, product_sku, quantity]);

            linesInserted++;
        }

        await client.query("COMMIT");

        console.log("Migration completed successfully.");

        return {
            rows: rows.length,
            customersUpserted,
            suppliersUpserted,
            productsUpserted,
            linesInserted
        };

    } catch (error) {

        await client.query("ROLLBACK");
        console.error("Migration error:", error);
        throw error;

    } finally {
        client.release();
    }
}