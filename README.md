# LogiTech Solutions
## Project Overview

**MegaStore Global** is a very large company that works with supplies. They had been using only an Excel spreadsheet, which resulted in numerous spelling errors, duplicate data, and inconsistent pricing.

Now, the MegaStore API has allowed them to migrate this legacy system to a modern, scalable, and persistent architecture, exposing information through a REST API. It combines the advantages of relational databases (PostgreSQL) for structured data and NoSQL databases (MongoDB) for semi-structured data, guaranteeing scalability, consistency, and performance.

## Features

• Supplier Analysis:
Enables you to see which suppliers have sold the most products (in number of items) and the total inventory value associated with each one.

• Customer Behavior:
Enables you to generate and view the purchase history of a specific customer, detailing products, dates, and the total spent in each transaction.

• Top-Selling Products:
Enables you to generate a list of the best-selling products within a specific category, ordered by revenue generated.

• Data Migration: Normalize and distribute data from CSV files to PostgreSQL and MongoDB.

## Justification for Hybrid Persistence
SQL (PostgreSQL):
Used for structured data that requires strict relationships and constraints (e.g., customers, products, suppliers, etc.).

NoSQL (MongoDB):
Used for transaction histories, optimized for fast reads and a flexible schema.

## Normalization in PostgreSQL
1NF: Repeating groups were eliminated by creating separate tables for Doctors, patients, and appointments.

2NF: Partial dependencies were eliminated by linking tables using foreign keys.

3NF: Transitive dependencies were eliminated by separating insurers and specialties.

## Setup Instructions
### Prerequisites

PostgreSQL 12+
MongoDB 6+

### Installation
Clone the repository:

git clone <repository-url>
cd simulacro
Install dependencies:

npm install
Configure environment variables:

Copy .env.example to .env and update values.
Run the migration script:

node scripts/run-migration.js
Start the server:

npm start

## Project Structure
Prueba-de-db/
├── src/
│ ├── config/
│ │ ├── env.js
│ │ ├── mongodb.js
│ │ └── postgres.js
│ ├── middlewares/
│ │ └── errorHandler.js
├── data/
│ ├── AM-prueba-desempeno-data_m4.csv
│ ├── script_logitech.sql
├── scripts/
│ └── run-migration.js
│ ├── routes/
│ │ ├── customers.js
│ │ ├── products.js
│ │ ├── suppliers.js
│ │ ├── reports.js
│ │ └── simulacro.js
│ ├── services/
│ │ ├── customerServices.js
│ │ └── migrationService.js
│ ├── models/
│ │ ├── 
│ │ └── 
│ ├── app.js
│ └── server.js
├── .env.example
├── .gitignore
├── package-lock.json
├── package.json
└── README.md



## API Endpoints


### Customers
GET /customers (listar, filtros por email/nombre)

GET /customers/:email (buscar por email)

POST /customers (crear)

PUT /customers/:email (actualizar)

DELETE /customers/:email (borrar)



### Products
GET /products (listar, filtros por categoría/sku)

GET /products/:sku

POST /products

PUT /products/:sku

DELETE /products/:sku



### Suppliers
GET /suppliers

GET /suppliers/:email

POST /suppliers

PUT /suppliers/:email

DELETE /suppliers/:email



### Reports (ventas)
GET /reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD

GET /reports/top-products?limit=10

GET /reports/top-customers?limit=10

GET /reports/by-category


### Author
Maria Camila Vidales Espinosa
Email: mariacvidales@gmail.com
Role: Riwi's Developer


### Contributing
Feel free to submit issues or pull requests to improve this project.

### License
This project is licensed under the Riwi License.




