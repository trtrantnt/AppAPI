var express = require('express');
var router = express.Router();
let categorySchema = require('../schemas/category')
let slugify  = require('slugify')

/* GET users listing. */
router.get('/', async function(req, res, next) {
    let categories = await categorySchema.find({});
    res.send(categories);
});

router.get('/all', async function(req, res, next) {
    try {
        let categories = await categorySchema.find({});
        res.status(200).send({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});

// Add new route to get categories with product counts - MOVED BEFORE /:id route
router.get('/with-products', async function(req, res, next) {
    try {
        const productSchema = require('../schemas/product');
        const categories = await categorySchema.find({});
        
        // Get product counts for each category
        const result = await Promise.all(categories.map(async (category) => {
            const count = await productSchema.countDocuments({ category: category._id });
            return {
                _id: category._id,
                name: category.name,
                description: category.description,
                slug: category.slug,
                productCount: count
            };
        }));
        
        res.status(200).send({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});

// Add an alias route for the same functionality, to be consistent with frontend expectations
router.get('/with-product-count', async function(req, res, next) {
    try {
        const productSchema = require('../schemas/product');
        const categories = await categorySchema.find({});
        
        // Get product counts for each category
        const result = await Promise.all(categories.map(async (category) => {
            const count = await productSchema.countDocuments({ category: category._id });
            return {
                _id: category._id,
                name: category.name,
                description: category.description,
                slug: category.slug,
                productCount: count
            };
        }));
        
        res.status(200).send({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});

router.get('/:id', async function(req, res, next) {
    try {
        let category = await categorySchema.findById(req.params.id);
        res.send({
            success:true,
            data:category
        });
    } catch (error) {
        res.status(404).send({
            success:false,
            message:error.message
        })
    }
});
router.post('/', async function(req, res, next) {
    try {
        let body = req.body;
        let newCategory = categorySchema({
            name:body.name,
            description:body.description,
            slug: slugify(body.name, {
                lower: true
            })
        });
        await newCategory.save()
        res.status(200).send({
            success:true,
            data:newCategory
        });
    } catch (error) {
        res.status(404).send({
            success:false,
            message:error.message
        })
    }
});

router.put('/:id', async function(req, res, next) {
    try {
        let body = req.body;
        let updatedObj = {}
        if(body.name){
            updatedObj.name = body.name
        }if(body.description){
            updatedObj.description = body.description
        }
        let updatedCategory =  await categorySchema.findByIdAndUpdate(req.params.id,updatedObj,{new:true})
        res.status(200).send({
            success:true,
            data:updatedCategory
        });
    } catch (error) {
        res.status(404).send({
            success:false,
            message:error.message
        })
    }
});
router.delete('/:id', async function(req, res, next) {
    try {
        let body = req.body;
        let updatedCategory =  await categorySchema.findByIdAndUpdate(req.params.id,{
            isDeleted:true
        },{new:true})
        res.status(200).send({
            success:true,
            data:updatedCategory
        });
    } catch (error) {
        res.status(404).send({
            success:false,
            message:error.message
        })
    }
});

// Helper endpoint to create test categories if they don't exist
router.post('/create-test-categories', async function(req, res, next) {
    try {
        const testCategories = [
            {
                name: "Đồ uống",
                description: "Nước ngọt, cà phê, trà, sinh tố,..."
            },
            {
                name: "Đồ ăn",
                description: "Các món ăn chính, khai vị, tráng miệng, v.v."
            }
        ];
        
        const results = [];
        
        for (const cat of testCategories) {
            // Check if category exists
            let existingCategory = await categorySchema.findOne({ name: cat.name });
            
            if (!existingCategory) {
                // Create if it doesn't exist
                let newCategory = new categorySchema({
                    name: cat.name,
                    description: cat.description,
                    slug: slugify(cat.name, { lower: true })
                });
                
                await newCategory.save();
                results.push({
                    name: newCategory.name,
                    id: newCategory._id,
                    status: 'created'
                });
            } else {
                results.push({
                    name: existingCategory.name,
                    id: existingCategory._id,
                    status: 'already exists'
                });
            }
        }
        
        res.status(200).send({
            success: true,
            message: 'Test categories processed',
            categories: results
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
