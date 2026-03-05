import { app } from "./app.js";
import { env } from "./config/env.js";
//import { connectMongoDB } from "./config/mongoDB.js";
import { createTables } from "./config/postgres.js";
import { migration } from "./services/migrationServices.js";



try {
    console.log('Conecting to MongoDB...');
    //await connectMongoDB();
    console.log('Conecting to PostgresSQL...');
    await createTables()
    await migration()
    app.listen(env.port, () => {
        console.log(`server running on port ${env.port}`);
        console.log(`Endpoint disponibles:`);

    })

} catch (error) {
    console.log(error);
    process.exit(1)
}