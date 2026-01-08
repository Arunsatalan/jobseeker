
const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema(
    {
        employer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
        },
        amount: {
            type: Number,
            required: true, // Positive for purchase, negative for usage
        },
        type: {
            type: String,
            enum: ['purchase', 'deduction', 'refund', 'bonus'],
            required: true,
        },
        description: String,
        metadata: {
            jobId: mongoose.Schema.Types.ObjectId,
            applicationId: mongoose.Schema.Types.ObjectId,
            paymentId: String,
        }
    },
    { timestamps: true }
);

creditTransactionSchema.index({ employer: 1 });
creditTransactionSchema.index({ company: 1 });
creditTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema);
