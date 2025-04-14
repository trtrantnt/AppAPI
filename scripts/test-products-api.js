const mongoose = require('mongoose');
const productSchema = require('../schemas/product');

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/S6")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

async function testProductsQuery() {
  try {
    console.log("Fetching products...");
    
    const products = await productSchema.find({}).populate('category');
    
    console.log("Total products found:", products.length);
    
    if (products.length > 0) {
      console.log("Sample product:", JSON.stringify(products[0], null, 2));
    } else {
      console.log("No products found in the database.");
      
      // Create a test product if none exist
      console.log("Creating a test product...");
      
      // Find default category or create one
      const categorySchema = require('../schemas/category');
      let category = await categorySchema.findOne({});
      
      if (!category) {
        category = new categorySchema({
          name: "Test Category",
          slug: "test-category",
          description: "A test category"
        });
        await category.save();
      }
      
      const newProduct = new productSchema({
        name: "Test Product",
        slug: "test-product",
        description: "A test product",
        price: 9.99,
        category: category._id
      });
      
      await newProduct.save();
      console.log("Test product created:", newProduct);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

testProductsQuery();
