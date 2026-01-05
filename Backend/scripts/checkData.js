const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Application = require('../src/models/Application');
const Job = require('../src/models/Job');
const User = require('../src/models/User');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
console.log(`Loading env from: ${envPath}`);
dotenv.config({ path: envPath });

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/canadajobs';
        console.log(`Connecting to: ${uri}`);
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        const appCount = await Application.countDocuments();
        console.log(`Total Applications: ${appCount}`);

        if (appCount > 0) {
            const sampleApp = await Application.findOne().populate('job').populate('applicant');
            console.log('Sample Application:', JSON.stringify(sampleApp, null, 2));

            // Test Aggregation
            const trendsAggregation = await Application.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            status: "$status"
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]);
            console.log('Trends Aggregation:', JSON.stringify(trendsAggregation, null, 2));
        } else {
            console.log("No applications found in the database. Charts will be empty.");

            // Optional: Create a dummy application if none exist (for testing purposes, but maybe better to ask user)
            // console.log("Creating dummy data...");
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
