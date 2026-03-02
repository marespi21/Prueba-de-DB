import { Router } from "express";
import { getCustomer, getCustomerByCode, updateCustomerByCode } from "../services/customerServices.js";

const router = Router();

router.get('/', async (req, res) => {
    try {
        const customers = await getCustomer()
        res.status(200).json(
            {
                message: 'Customers get successfully',
                customers
            }
        )
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.get('/:code', async (req, res) => {
    const { code } = req.params
    try {
        const customer = await getCustomerByCode(code)
        if (!customer) {
            return res.status(404).json({message : "Customer not found"})
        }
        res.status(200).json(
            {
                message: 'Customer get successfully',
                customer
            }
        )
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.patch('/:code', async (req, res) =>{
    const { code } = req.params
    await updateCustomerByCode(req.body, code)
    res.status(200).json({message: "Customer updated"})
})

export default router