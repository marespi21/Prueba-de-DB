import pg from "pg"; //grupo de conexiones, crea paquetes de 10 conexiones, se puede configuarra el tamaño
import { env } from "./env.js";
import { readFile } from "fs/promises";
import { resolve } from "path";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.postgresUri, //configuración para la url de la conexion
});

export default pool;

export async function createTables() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Leer archivo SQL
    const sqlPath = resolve(env.filesql); //undefined
    const sql = await readFile(sqlPath, "utf-8"); 

    // script to create table 
    await client.query(sql); // AQui se poner lo creado en sql
    await client.query("COMMIT"); // poner esto para finalizar mi script
    console.log("Tablas creadas correctamente");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creando tablas", error);
  } finally {
    client.release(); //liberar la conexión para usar despues
  }
}

export async function migrateData() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ejemplo: Crear tabla de ejemplo
    await client.query(`
      CREATE TABLE IF NOT EXISTS example_table (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query("COMMIT");
    console.log("Migración completada exitosamente");
    return { message: "Migración completada" };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error durante la migración", error);
    throw error;
  } finally {
    client.release();
  }
}