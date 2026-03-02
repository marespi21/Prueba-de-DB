import express from "express";
import migrateRouter from "./routes/migrate.js";
import { connectMongoDB } from "./routes/customers.js";


export const app = express();

app.use(express.json())

app.use('/api/simulacro', migrateRouter )

export default app;
