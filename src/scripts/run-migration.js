import { migrateData } from '../services/migrationServices.js';

(async () => {
    try {
        console.log('Starting data migration...');
        await migrateData();
        console.log('Data migration completed successfully.');
    } catch (error) {
        console.error('Error during data migration:', error);
        process.exit(1);
    }
})();