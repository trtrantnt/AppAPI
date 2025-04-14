var express = require('express');
var router = express.Router();
let productSchema = require('../schemas/product')
let categorySchema = require('../schemas/category')
let slugify = require('slugify')
let { check_authentication, check_authentication_optional } = require('../utils/check_auth')
let { CreateSuccessResponse, CreateErrorResponse } = require('../utils/responseHandler')

/* GET users listing. */
router.get('/', check_authentication_optional, async function (req, res, next) {
    try {
        let query = req.query;
        console.log("Query params:", query);
        
        let objQuery = {};
        
        // Name filter
        if (query.name) {
            objQuery.name = new RegExp(query.name, 'i');
        }
        
        // Price filter
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
                objQuery.price.$lte = 1000000000; // Higher default upper limit
            }
        } else {
            objQuery.price.$gte = 0;
            objQuery.price.$lte = 1000000000;
        }
        
        // Category filter
        if (query.category) {
            objQuery.category = query.category;
        }
        
        // Pagination
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Sorting
        let sort = {};
        if (query.sort) {
            if (query.sort.startsWith('-')) {
                sort[query.sort.substring(1)] = -1;
            } else {
                sort[query.sort] = 1;
            }
        } else {
            sort = { createdAt: -1 }; // Default sort by newest
        }
        
        console.log("Constructed query:", JSON.stringify(objQuery));
        
        // Execute query with pagination
        const products = await productSchema.find(objQuery)
            .populate('category')
            .sort(sort)
            .skip(skip)
            .limit(limit);
        
        // Get total count for pagination
        const total = await productSchema.countDocuments(objQuery);
        
        // Format response - Đảm bảo cấu trúc dữ liệu trả về chuẩn với frontend
        res.status(200).send({
            success: true,
            data: {
                data: products,
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error in GET /products:", error);
        CreateErrorResponse(res, 500, error.message || "Internal Server Error");
    }
});

router.get('/:id', check_authentication_optional, async function (req, res, next) {
    try {
        let product = await productSchema.findById(req.params.id).populate('category');
        if (!product) {
            return CreateErrorResponse(res, 404, "Không tìm thấy sản phẩm");
        }
        
        // Trả về dữ liệu với cấu trúc phù hợp với frontend
        res.status(200).send({
            success: true,
            data: {
                data: product
            }
        });
    } catch (error) {
        console.error("Error getting product:", error);
        CreateErrorResponse(res, 500, error.message || "Internal Server Error");
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
            // Cấu trúc phản hồi thống nhất
            CreateSuccessResponse(res, 200, {
                data: newProduct
            });
        } else {
            // Let's list available categories to help diagnose the issue
            const availableCategories = await categorySchema.find({}, 'name _id');
            
            CreateErrorResponse(res, 404, {
                message: "Không tìm thấy danh mục",
                providedCategory: body.category,
                availableCategories: availableCategories
            });
        }
    } catch (error) {
        console.error("Error creating product:", error);
        CreateErrorResponse(res, 500, error.message || "Error creating product");
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
        
        // Cấu trúc phản hồi thống nhất
        CreateSuccessResponse(res, 200, {
            data: updatedProduct
        });
    } catch (error) {
        console.error("Error updating product:", error);
        CreateErrorResponse(res, 500, error.message || "Error updating product");
    }
});

router.delete('/:id', async function (req, res, next) {
    try {
        let updatedProduct = await productSchema.findByIdAndUpdate(req.params.id, {
            isDeleted: true
        }, { new: true })
        
        // Đảm bảo phản hồi nhất quán với các API khác
        CreateSuccessResponse(res, 200, {
            data: updatedProduct
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        CreateErrorResponse(res, 500, error.message || "Error deleting product");
    }
});

// Route sản phẩm theo slug nên đặt trước route theo ID để tránh xung đột
router.get('/by-slug/:slug', async function (req, res, next) {
    try {
        let product = await productSchema.findOne({ slug: req.params.slug }).populate('category');
        if (!product) {
            return CreateErrorResponse(res, 404, "Không tìm thấy sản phẩm");
        }
        
        // Cấu trúc phản hồi nhất quán
        CreateSuccessResponse(res, 200, {
            data: product
        });
    } catch (error) {
        console.error("Error getting product by slug:", error);
        CreateErrorResponse(res, 500, error.message || "Internal Server Error");
    }
});

module.exports = router;
