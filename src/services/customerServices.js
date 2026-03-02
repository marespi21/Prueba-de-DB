import { pool } from "../config/postgres.js"
import fs from 'fs';
import csv from 'csv-parser';
import { env } from "../config/env.js";
import { AcademicTranscripts } from "../models/transcripts.js";

export async function queryTables() {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        //create table 
        await client.query(`
        CREATE TABLE IF NOT EXISTS "customers" (
    "customer_email" TEXT PRIMARY KEY,
    "customer_name" TEXT,
    "customer_address" TEXT,
    "customer_phone" TEXT
    );
            `)

        //create table suppliers
        await client.query(`
        CREATE TABLE IF NOT EXISTS "suppliers" (
    "supplier_email" TEXT PRIMARY KEY,
    "supplier_name" TEXT
    );
                `)

        //create table products
        await client.query(`    
        CREATE TABLE IF NOT EXISTS "products" (
    "product_sku" TEXT PRIMARY KEY,
    "product_name" TEXT,
    "product_category" TEXT,
    "unit_price" NUMERIC,
    "supplier_email" TEXT
);
            `)

        //create table course
        await client.query(`
            
            
        CREATE TABLE IF NOT EXISTS transaction_lines (
    id BIGSERIAL PRIMARY KEY,
    transaction_id TEXT NOT NULL,
    date DATE NOT NULL,
    customer_email TEXT REFERENCES customers(customer_email),
    product_sku TEXT REFERENCES products(product_sku),
    quantity INT,
    total_line_value NUMERIC
);

        );
`)

        await client.query(`
        CREATE INDEX IF NOT EXISTS idx_txn_lines_txn ON "transaction_lines"("transaction_id");
        CREATE INDEX IF NOT EXISTS idx_txn_lines_date ON "transaction_lines"("date");
        `)


        await client.query('COMMIT')
    } catch (error) {
        await client.query('ROLLBACK')
    } finally {
        client.release()
    }
}

export async function queryData() {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const result = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(env.fileDataCsv)
                .pipe(csv())
                .on("data", (data) => result.push(data))
                .on("end", resolve)
                .on("error", reject);
        });
        const counters = {
            contStudents: 0,
            contCourses: 0,
            contEnrollments: 0,
            contProfessors: 0,
            contDepartments: 0
        }
        for (const row of result) {
            const studentName = row.student_name.trim().replace(/\s+/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            const studentEmail = row.student_email.trim().toLowerCase();
            const studentPhone = row.student_phone.trim();
            const professorName = row.professor_name.trim();
            const professorEmail = row.professor_email.trim().toLowerCase();
            const department = row.department.trim();
            const courseCode = row.course_code.trim().toUpperCase();
            const courseName = row.course_name.trim();
            const credits = parseInt(row.credits);
            const semester = row.semester.trim();
            const grade = parseFloat(row.grade);
            const tuitionFee = parseInt(row.tuition_fee);
            const amountPaid = parseInt(row.amount_paid);

            const student_result = await client.query(`
                INSERT INTO "student" ("name", "email", "phone") VALUES ($1, $2, $3) ON CONFLICT ("email")
                DO UPDATE SET 
                    name = EXCLUDED.name
                returning xmax
                `, [studentName, studentEmail, studentPhone])
               


            const department_result = await client.query(`
                INSERT INTO "department" ("name") VALUES ($1) ON CONFLICT ("name")
                DO UPDATE SET 
                    name = EXCLUDED.name
                returning xmax
                `, [department])

            const departmentId = await client.query(`select id from department where name = $1`, [department])


            const professor_result = await client.query(`
                INSERT INTO "profesor" ("name", "email", "department_id") VALUES ($1, $2, $3) ON CONFLICT ("email")
                DO UPDATE SET 
                    name = EXCLUDED.name
                returning xmax
                `, [professorName, professorEmail, departmentId.rows[0].id])

            const profesorId = await client.query(`select id from profesor where email = $1`, [professorEmail])

            const course_result = await client.query(`
                INSERT INTO "course" ("code", "name", "credits", "profesor_id") VALUES ($1, $2, $3, $4) ON CONFLICT ("code")
                DO UPDATE SET 
                    name = EXCLUDED.name
                returning xmax
                `, [courseCode, courseName, credits, profesorId.rows[0].id])


            const studentId = await client.query(`select id from student where email = $1`, [studentEmail.toLowerCase()])


            const enrollment_result = await client.query(`
                INSERT INTO "enrrollments" ("enrolmment_id", "semester", "grade", "tuition_fee", "student_id", "course_code") VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT ("enrolmment_id")
                DO UPDATE SET 
                    semester = EXCLUDED.semester,
                    grade = EXCLUDED.grade,
                    tuition_fee = EXCLUDED.tuition_fee,
                    student_id = EXCLUDED.student_id,
                    course_code = EXCLUDED.course_code
                returning xmax
                `, [row.enrolmment_id, semester, grade, tuitionFee, studentId.rows[0].id, courseCode])



            await AcademicTranscripts.findOneAndUpdate(
                { "studentEmail": studentEmail },
                {
                    $setOnInsert: {
                        "studentEmail": studentEmail,
                        "studentName": studentName,
                        "summary": {
                            "totalCreditsEarned": 4,
                            "averageGrade": 4.5
                        },
                    },
                    $push: {
                        "academicHistory": {
                            "courseCode": courseCode,
                            "courseName": courseName,
                            "credits": credits,
                            "semester": semester,
                            "professorName": professorName,
                            "grade": grade,
                            "status": "Aprobado"
                        }
                    }


                },
                { upsert: true }
            )
            if (student_result.rows[0].xmax === '0') counters.contStudents++;
            if (course_result.rows[0].xmax === '0') counters.contCourses++;
            if (enrollment_result.rows[0].xmax === '0') counters.contEnrollments++;
            if (professor_result.rows[0].xmax === '0') counters.contProfessors++;
            if (department_result.rows[0].xmax === '0') counters.contDepartments++;

            
        }
        let totalCredits = await client.query(`
                    select Round(AVG(e.grade),1) as average_grade , s.email , sum(c.credits) as total_credits from student s 
join enrrollments e on s.id = e.student_id                      
join course c on e.course_code = c.code group by s.email  ;     
                    `)
        for (const student of totalCredits.rows) {

            await AcademicTranscripts.updateOne(
                { studentEmail: student.email },
                {
                    $set: {
                        "summary.totalCreditsEarned": parseInt(student.total_credits),
                        "summary.averageGrade": parseInt(student.average_grade)
                    }
                }
            );

        }

        await client.query('COMMIT')
        return counters

    } catch (error) {
        console.log(error);
        await client.query('ROLLBACK')
    } finally {
        client.release()
    }
}