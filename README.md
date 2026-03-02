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















1. Introducción
Te has unido al equipo de ingeniería de LogiTech Solutions, una consultora especializada
en modernización de sistemas para retail y comercio electrónico.
Uno de sus clientes más grandes, el gigante de suministros "MegaStore Global", enfrenta
una crisis operativa. Durante años, han manejado todo su inventario, ventas, proveedores
y clientes en un único archivo maestro de Excel.
El volumen de datos ha crecido tanto que el archivo es inmanejable: hay inconsistencias
en los precios, direcciones de clientes duplicadas con errores ortográficos y es imposible
saber el stock real en tiempo real.
Tu misión: Actuar como Arquitecto de Datos y Desarrollador Backend para migrar este
"sistema legado" a una arquitectura moderna, escalable y persistente, exponiendo la
información a través de una API REST.

2. Objetivos
El objetivo de esta prueba es evaluar tu capacidad para:
1. Analizar y diseñar: Tomar un set de datos plano y desorganizado, y proponer una
arquitectura de persistencia adecuada.
2. Arquitectura del modelo: Diseñar un esquema de base de datos que elimine
redundancias innecesarias y asegure la integridad de la información.
3. Persistencia: Implementar un motor relacional SQL y un motor NoSQL.
4. Desarrollo backend: Construir una API con Express.js para la gestión de datos.
5. Inteligencia de negocio: Resolver requerimientos de información complejos
mediante consultas o agregaciones.
6. Log de auditorías: Manejar log de transacciones en escenarios especificos desde


Mongo DB.
3. Requisitos técnicos
Fase 1: Análisis y modelado de datos
• Fuente de datos: Analizarás la estructura de un archivo plano (Excel/CSV) que
contiene información mezclada:
o ID Transacción, Fecha, Nombre Cliente, Email Cliente, Dirección, Categoría
Producto, SKU, Nombre Producto, Precio Unitario, Cantidad, Nombre
Proveedor, Contacto Proveedor.
• Diseño del modelo:
o Debes definir qué información será almacenada en un motor relacional
(PostgreSQL o MySQL) y cuál en un motor NoSQL (MongoDB).
o Debes justificar técnicamente tu decisión.
o No se evaluará únicamente que ambos motores estén implementados, sino
la coherencia de tu arquitectura.
o Para SQL: Debes aplicar las formas normales (1FN, 2FN, 3FN) según se
requiera, para descomponer la información en tablas relacionadas.
o Para NoSQL (ej. MongoDB): Debes diseñar un esquema eficiente,
justificando qué datos se normalizan (referencias) y qué datos se incrustan
(embedding) para optimizar la lectura.
• Diagrama: Debes entregar una representación visual de tu modelo (DER y
Diagrama de Colecciones) hecho en una herramienta externa (draw.io o similar).
Fase 2: Implementación de base de datos (db_megastore_exam)
• Es obligatorio utilizar MongoDB (NOSQL) y un motor relacional SQL (PostgreSQL
o MySQL) dentro de la solución propuesta.
• Convención de Nombres: Todas las tablas/colecciones y atributos/campos deben
estar en Inglés.
• Integridad:
o (SQL): Uso estricto de Llaves Primarias (PK), Foráneas (FK) y Restricciones
(UNIQUE, NOT NULL).
o (NoSQL): Uso de Validación de Esquema (Schema Validation) o índices
únicos para evitar duplicidad de entidades clave.
Fase 3: Migración masiva de datos (El reto)
• El sistema debe ser capaz de ingerir el archivo plano desorganizado y distribuir la
información en tu nuevo modelo de datos.
• Idempotencia: Debes implementar una lógica que evite la duplicación de
entidades maestras.
o Ejemplo: Si el cliente "Juan Pérez" aparece en 10 filas de transacciones
diferentes en el CSV, tu base de datos solo debe crear un registro de cliente
y vincular las 10 órdenes a él.
• Este proceso de carga debe ser ejecutable mediante un script o un endpoint
específico de la API.
Fase 4: Backend CRUD (Express.js)
• Desarrolla un servidor RESTful usando Node.js y Express.
• Selecciona UNA entidad principal de tu modelo (ej: Products, Orders o Suppliers) y
desarrolla un CRUD completo para gestionarla, además de guardar un log de
registros en MongoDB cada que se elimine, para poder hacer auditoria sobre ellos.
• El código debe ser modular, limpio y organizado.
• La conexión a la base de datos debe ser robusta y manejar errores correctamente.
Fase 5: Consultas avanzadas (Business Intelligence)
El Gerente de operaciones necesita visualizar la siguiente información a través de
Postman:
• Análisis de proveedores:
o "Necesito saber qué proveedores nos han vendido más productos (en cantidad
de items) y cuál es el valor total del inventario que tenemos asociado a cada
uno."
• Comportamiento del cliente:
o "Quiero ver el historial de compras de un cliente específico, detallando
productos, fechas y el total gastado en cada transacción."
• Productos estrella:
o "Genera un listado de los productos más vendidos dentro de una categoría
específica, ordenados por ingresos generados."
(Nota: Para SQL, esto requiere JOINs/Group By. Para NoSQL, esto requiere Aggregation
Framework).



4. Entregables
1. Repositorio de GitHub:
a. Código fuente del proyecto.
b. Carpeta /docs con:
i. Diagrama del Modelo de Datos (Imagen o PDF).
ii. Archivo CSV de muestra (La "Data Cruda" que usaste para las
pruebas).
iii. Scripts de Base de Datos (DDL para SQL y Scripts de Validación para
NoSQL).
c. Colección de Postman (exportada como .json).
d. README.md.
5. Documentación (README.md)
Debe estar redactado en Inglés (para simular un entorno internacional) e incluir:
• Pasos para desplegar y ejecutar el proyecto localmente.
• Justificación del modelo: Explica por qué estructuraste la base de datos de esa
manera.
o (Crítico para NoSQL: ¿Por qué embebiste vs referenciaste?)
o (Crítico para SQL: Explica el proceso de normalización).
• Guía de cómo usar el endpoint/script de Migración Masiva.
• Descripción de los Endpoints disponibles.
7. Criterios de aceptación
• Lógica de migración: El algoritmo de carga detecta y gestiona registros
existentes correctamente (previene duplicados).
• Modelo de datos:
o (SQL) Cumple con la 3FN.
o (NoSQL) Demuestra un balance entre eficiencia de lectura/escritura (no
es un dump plano).
• Calidad del backend: Código organizado, uso de variables de entorno (.env),
códigos de estado HTTP correctos.
• Consultas: Responden con exactitud a las preguntas de negocio planteadas.
8. Es un plus si:
• Utilizas procedimientos almacenados, triggers o vistas.
• Documentas instalación de motores en Ubuntu con comandos.
• Si entregas una interfaz visual para un cliente final.




transaction_id
date

CUSTOMERS
customer_id
customer_name
Customes_email
customer_address
customer_phone

PRODUCTS
product_sku
product_name
product_category
unit_price



TRANSACTIONS
transactions_id
date
customer_id
total_line_value




TRANSACTIONS_DETAILS
transaction_detail_value
transaction_id
product_sku
quantity
supplier_id


levantar dont env
y levantar pg


Simulacro
POST /simulacro/load (carga CSV → inserta/actualiza en BD)

POST /simulacro/reset (opcional: limpia tablas/colecciones)

GET /simulacro/health (ping BD)



