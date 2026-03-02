import { pool } from "../config/postgres.js";

async function getCustomer() {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const result = await client.query('select c.id , c.name, c.email , p."name" as profesor_name  FROM "customer" c join profesor p on c.profesor_id = p.id ;')
        await client.query('COMMIT')
        return result.rows
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
}

async function getCustomerByCode(code) {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const result = await client.query('select c.id, c.name, c.email , p."name" as profesor_name  FROM "customer" c join profesor p on c.profesor_id = p.id  WHERE c.customer_id = $1;',[code])
        await client.query('COMMIT')
        
        return result.rows[0]
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
}

async function updateCustomerByCode(data,code) {
     const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const result = await client.query('update course c set name = COALESCE($1,name), credits = COALESCE($2,credits), profesor_id = COALESCE($3,profesor_id) where c.code = $4', [data.name , data.credits, data.profesor_id ,code])
        await client.query('COMMIT')
        
        return result.rows[0]
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
}


export { getCustomer, getCustomerByCode, updateCustomerByCode}

