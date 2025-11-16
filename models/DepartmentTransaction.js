const mongoose = require('mongoose');

const departmentTransactionSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DepartmentCategory',
      required: false,
    },
    transactions: [
      {
        transactionTypeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'TransactionType',
        },
      },
    ],
  },
  { versionKey: false },
);

module.exports = mongoose.model('DepartmentTransaction', departmentTransactionSchema);
