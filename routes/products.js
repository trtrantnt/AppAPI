var express = require('express');
var router = express.Router();
let productSchema = require('../schemas/product')
let categorySchema = require('../schemas/category')
let slugify = require('slugify')
/* GET users listing. */
router.get('/', async function (req, res, next) {
    let query = req.query;
    console.log(query);
    let objQuery = {};
    if (query.name) {
        objQuery.name = new RegExp(query.name, 'i')
    } else {
        objQuery.name = new RegExp("", 'i')
    }
    objQuery.price = {};
    if (query.price) {
        if (query.price.$gte) {
            objQuery.price.$gte = Number(query.price.$gte);
        } else {
            objQuery.price.$gte = 0;
        }
        if (query.price.$lte) {
            objQuery.price.$lte = Number(query.price.$lte);
        } else {
            objQuery.price.$lte = 10000;
        }
    } else {
        objQuery.price.$lte = 10000;
        objQuery.price.$gte = 0;
    }

    let products = await productSchema.find(objQuery).populate(
        { path: 'category', select: 'name' }
    );
    res.send(products);
});

router.get('/:id', async function (req, res, next) {
    try {
        let product = await productSchema.findById(req.params.id);
        res.send({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(404).send({
            success: false,
            message: error.message
        })
    }
});

router.post('/', async function (req, res, next) {
    try {
        let body = req.body;
        
        // Debug information - log what we received
        console.log("Creating product with data:", body);
        
        if (!body.category) {
            return res.status(400).send({
                success: false,
                message: "Category is required"
            });
        }
        
        let category;
        
        // Check if body.category is a valid MongoDB ObjectId
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(body.category);
        
        if (isValidObjectId) {
            console.log("Looking up category by ID:", body.category);
            category = await categorySchema.findById(body.category);
            if (!category) {
                console.log("No category found with ID:", body.category);
            }
        } else {
            console.log("Looking up category by name:", body.category);
            category = await categorySchema.findOne({ name: body.category });
            if (!category) {
                console.log("No category found with name:", body.category);
            }
        }
        
        if (category) {
            console.log("Found category:", category.name, "with ID:", category._id);
            
            let newProduct = productSchema({
                name: body.name,
                price: body.price ? body.price : 1000,
                quantity: body.quantity ? body.quantity : 10,
                description: body.description ? body.description : "khong co mo ta",
                imgURL: body.imgURL ? body.imgURL : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                category: category._id,
                slug: slugify(body.name, {
                    lower: true
                })
            });
            
            await newProduct.save();
            res.status(200).send({
                success: true,
                data: newProduct
            });
        } else {
            // Let's list available categories to help diagnose the issue
            const availableCategories = await categorySchema.find({}, 'name _id');
            
            res.status(404).send({
                success: false,
                message: "Không tìm thấy danh mục",
                providedCategory: body.category,
                availableCategories: availableCategories
            });
        }
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});

router.put('/:id', async function (req, res, next) {
    try {
        let body = req.body;
        let updatedObj = {}
        if (body.name) {
            updatedObj.name = body.name
        }
        if (body.quantity) {
            updatedObj.quantity = body.quantity
        }
        if (body.price) {
            updatedObj.price = body.price
        }
        if (body.description) {
            updatedObj.description = body.description
        }
        if (body.imgURL) {
            updatedObj.imgURL = body.imgURL
        }
        if (body.category) {
            updatedObj.category = body.category
        }
        let updatedProduct = await productSchema.findByIdAndUpdate(req.params.id, updatedObj, { new: true })
        res.status(200).send({
            success: true,
            data: updatedProduct
        });
    } catch (error) {
        res.status(404).send({
            success: false,
            message: error.message
        })
    }
});
router.delete('/:id', async function (req, res, next) {
    try {
        let body = req.body;
        let updatedProduct = await productSchema.findByIdAndUpdate(req.params.id, {
            isDeleted: true
        }, { new: true })
        res.status(200).send({
            success: true,
            data: updatedProduct
        });
    } catch (error) {
        res.status(404).send({
            success: false,
            message: error.message
        })
    }
});

router.get('/api/products/:slug', async function (req, res, next) { // Thêm route mới
    try {
      let product = await productSchema.findOne({ slug: req.params.slug }); // Tìm sản phẩm theo slug
      if (product) {
        res.send({
          success: true,
          data: product
        });
      } else {
        res.status(404).send({
          success: false,
          message: "Không tìm thấy sản phẩm"
        });
      }
    } catch (error) {
      res.status(404).send({
        success: false,
        message: error.message
      });
    }
  });
module.exports = router;
