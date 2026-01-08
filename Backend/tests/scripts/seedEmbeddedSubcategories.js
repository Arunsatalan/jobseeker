const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../../src/models/Category');

const seedEmbeddedSubcategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all categories
    const categories = await Category.find({ isActive: true });
    console.log(`Found ${categories.length} categories`);

    const subcategoriesData = [
      { categoryName: 'Technology', subcategories: ['Software Development', 'DevOps', 'Data Engineering', 'Cybersecurity', 'Mobile Development', 'Web Development'] },
      { categoryName: 'Design', subcategories: ['UI/UX Design', 'Graphic Design', 'Product Design', 'Web Design', 'Brand Design', 'Motion Graphics'] },
      { categoryName: 'Marketing', subcategories: ['Digital Marketing', 'Content Marketing', 'SEO', 'Social Media', 'PPC', 'Email Marketing'] },
      { categoryName: 'Data Science', subcategories: ['Machine Learning', 'Data Analysis', 'Business Intelligence', 'AI', 'Data Visualization', 'Statistics'] },
      { categoryName: 'Healthcare', subcategories: ['Nursing', 'Medical Research', 'Healthcare Administration', 'Pharmacy', 'Physical Therapy', 'Medical Technology'] },
      { categoryName: 'Legal', subcategories: ['Corporate Law', 'Criminal Law', 'Intellectual Property', 'Compliance', 'Contract Law', 'Litigation'] },
      { categoryName: 'Manufacturing', subcategories: ['Production', 'Quality Control', 'Supply Chain', 'Engineering', 'Operations', 'Maintenance'] },
      { categoryName: 'Retail', subcategories: ['Store Management', 'Sales', 'Customer Service', 'Merchandising', 'Inventory Management', 'E-commerce'] },
      { categoryName: 'Human Resources', subcategories: ['Recruitment', 'Employee Relations', 'Training', 'HR Administration', 'Talent Management', 'Compensation'] },
      { categoryName: 'Construction', subcategories: ['Project Management', 'Architecture', 'Engineering', 'Site Supervision', 'Estimating', 'Safety Management'] }
    ];

    for (const categoryData of subcategoriesData) {
      const category = categories.find(cat => cat.name === categoryData.categoryName);
      if (category) {
        console.log(`Adding subcategories to ${categoryData.categoryName}`);

        // Clear existing subcategories first
        category.subcategories = [];

        for (const subName of categoryData.subcategories) {
          category.subcategories.push({
            name: subName,
            description: '',
            isActive: true,
            createdAt: new Date(),
          });
          console.log(`  Added: ${subName}`);
        }

        await category.save();
        console.log(`  Saved ${categoryData.subcategories.length} subcategories for ${categoryData.categoryName}`);
      } else {
        console.log(`Category not found: ${categoryData.categoryName}`);
      }
    }

    console.log('Embedded subcategory seeding completed!');
    await mongoose.connection.close();

  } catch (error) {
    console.error('Error seeding embedded subcategories:', error);
    process.exit(1);
  }
};

seedEmbeddedSubcategories();