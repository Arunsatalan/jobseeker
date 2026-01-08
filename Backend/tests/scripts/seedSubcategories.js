const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../../src/models/Category');
const Subcategory = require('../../src/models/Subcategory');

const seedSubcategories = async () => {
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
        console.log(`Seeding subcategories for ${categoryData.categoryName}`);

        for (const subName of categoryData.subcategories) {
          const existingSub = await Subcategory.findOne({
            name: subName,
            category: category._id
          });

          if (!existingSub) {
            await Subcategory.create({
              name: subName,
              category: category._id,
              createdBy: category.createdBy // Use the same creator as the category
            });
            console.log(`  Created: ${subName}`);
          } else {
            console.log(`  Already exists: ${subName}`);
          }
        }
      } else {
        console.log(`Category not found: ${categoryData.categoryName}`);
      }
    }

    console.log('Subcategory seeding completed!');
    await mongoose.connection.close();

  } catch (error) {
    console.error('Error seeding subcategories:', error);
    process.exit(1);
  }
};

seedSubcategories();