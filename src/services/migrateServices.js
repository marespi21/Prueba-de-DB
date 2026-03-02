
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { pg } from "../config/postgres.js";
import { httpError } from "../utils/httpError.js";

function absPath(p) {
// corre desde raíz del proyecto
return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

export async function loadCsvToDb(filePath) {
const full = absPath(filePath);
if (!fs.existsSync(full)) throw httpError(404, `No existe el archivo: ${filePath}`);

const rows = await new Promise((resolve, reject) => {
const out = [];
fs.createReadStream(full)
.pipe(csv())
.on("data", (r) => out.push(r))
.on("end", () => resolve(out))
.on("error", reject);
});

let customersUpserted = 0;
let productsUpserted = 0;
let suppliersUpserted = 0;
let linesInserted = 0;

await pg.query("BEGIN");

try {
for (const r of rows) {
// Customers
await pg.query(
`INSERT INTO customers (customer_email, customer_name, customer_address, customer_phone)
VALUES ($1,$2,$3,$4)
ON CONFLICT (customer_email) DO UPDATE
SET customer_name=EXCLUDED.customer_name,
customer_address=EXCLUDED.customer_address,
customer_phone=EXCLUDED.customer_phone`,
[r.customer_email, r.customer_name, r.customer_address, String(r.customer_phone || "")]
);
customersUpserted++;

// Suppliers
await pg.query(
`INSERT INTO suppliers (supplier_email, supplier_name)
VALUES ($1,$2)
ON CONFLICT (supplier_email) DO UPDATE
SET supplier_name=EXCLUDED.supplier_name`,
[r.supplier_email, r.supplier_name]
);
suppliersUpserted++;

// Products
await pg.query(
`INSERT INTO products (product_sku, product_name, product_category, unit_price, supplier_email)
VALUES ($1,$2,$3,$4,$5)
ON CONFLICT (product_sku) DO UPDATE
SET product_name=EXCLUDED.product_name,
product_category=EXCLUDED.product_category,
unit_price=EXCLUDED.unit_price,
supplier_email=EXCLUDED.supplier_email`,
[r.product_sku, r.product_name, r.product_category, Number(r.unit_price), r.supplier_email]
);
productsUpserted++;

// Transaction lines (una fila del CSV = una línea)
await pg.query(
`INSERT INTO transaction_lines
(transaction_id, date, customer_email, product_sku, quantity, total_line_value)
VALUES ($1,$2,$3,$4,$5,$6)`,
[
r.transaction_id,
r.date, // si te llega como string, en postgres igual funciona si es YYYY-MM-DD
r.customer_email,
r.product_sku,
Number(r.quantity),
Number(r.total_line_value)
]
);
linesInserted++;
}

await pg.query("COMMIT");
return { rows: rows.length, customersUpserted, suppliersUpserted, productsUpserted, linesInserted };
} catch (e) {
await pg.query("ROLLBACK");
throw e;
}
}

Routes/ Simulacro.js 

import { Router } from "express";
import * as migrationService from "../services/migrationService.js";

const router = Router();

router.post("/load", async (req, res, next) => {
try {
// opcional: permitir { filePath } en body; si no, usar default
const filePath = req.body?.filePath || "data/simulation_vistaestudio_data.csv";
const result = await migrationService.loadCsvToDb(filePath);
res.json(result);
} catch (e) { next(e); }
});

export default router;