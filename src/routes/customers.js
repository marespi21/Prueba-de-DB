import { Router } from "express";
import * as customerServices from "../services/customerServices.js";

const router = Router();

router.get("/", async (req, res, next) => {
try {
const rows = await customerServices.listCustomers(req.query);
res.json(rows);
} catch (e) { next(e); }
});

router.get("/:email", async (req, res, next) => {
try {
const row = await customerServices.getCustomerByEmail(req.params.email);
res.json(row);
} catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
try {
const created = await customerServices.createCustomer(req.body);
res.status(201).json(created);
} catch (e) { next(e); }
});

router.put("/:email", async (req, res, next) => {
try {
const updated = await customerServices.updateCustomer(req.params.email, req.body);
res.json(updated);
} catch (e) { next(e); }
});

router.delete("/:email", async (req, res, next) => {
try {
await customerServices.deleteCustomer(req.params.email);
res.status(204).send();
} catch (e) { next(e); }
});

export default router;

-------------------------------------------------

import { Router } from "express";
import { getCourses, getCoursesByCode, updateCourseByCode } from "../services/coursesServices.js";

const router = Router();

router.get('/', async (req, res) => {
    try {
        const courses = await getCourses()
        res.status(200).json(
            {
                message: 'Courses get successfully',
                courses
            }
        )
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})


router.get('/:code', async (req, res) => {
    const { code } = req.params
    try {
        const course = await getCoursesByCode(code)
        if (!course) {
            return res.status(404).json({message : "Course not found"})
        }
        res.status(200).json(
            {
                message: 'Course get successfully',
                course
            }
        )
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.patch('/:code', async (req, res) =>{
    const { code } = req.params
    await updateCourseByCode(req.body, code)
    res.status(200).json({message: "Course updated"})
})

export default router