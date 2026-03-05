//Configurar variables de entorno
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path"; // para obtener la ruta de donde va estar ubicado el archivo .env

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(__dirname, "../../.env") });

const required = ["MONGO_URI", "POSTGRES_URI"]; //Para que sean obligatorias

for (const key of required) {
    if (!process.env[key]) {
        console.log(`Error: Missing required environment variable ${key}`);
    }

}

export const env = {
    port: process.env.PORT ?? 3000,
    postgresUri: process.env.POSTGRES_URI,
    mongoUri: process.env.MONGO_URI,
    fileDataCsv: process.env.FILE_DATA_CSV ?? "./data/AM-prueba-desempeno-data_m4.csv",
    filesql: process.env.FILE_DATA_SQL ?? "./data/script_logitech.sql"
}