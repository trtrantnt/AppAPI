// Script to create a test category if it doesn't exist
require('../db');
const mongoose = require('mongoose');
const Category = require('../schemas/category');

async function createTestCategory() {
  try {
    // Check if "Đồ uống" category exists
    let category = await Category.findOne({ name: "Đồ uống" });
    
    if (!category) {
      // Create the category if it doesn't exist
      category = new Category({
        name: "Đồ uống",
        description: "Nước ngọt, cà phê, trà, sinh tố,...",
        slug: "do-uong"
      });
      
      await category.save();
      console.log('Created new category:', category);
    } else {
      console.log('Category already exists:', category);
    }
    
    // Display the category ID to use in your requests
    console.log('\nUse this category ID in your POST requests:');
    console.log('------------------------------------------');
    console.log(category._id.toString());
    console.log('------------------------------------------');
    
    // Close the connection
    setTimeout(() => mongoose.connection.close(), 1000);
    
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

createTestCategory();
