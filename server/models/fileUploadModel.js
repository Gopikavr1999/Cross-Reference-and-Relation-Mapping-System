const mongoose = require('mongoose');

const fileUploadModel = (fileName) => {
  const modelName = fileName.replace(/\.[^/.]+$/, "").replace(/\s+/g, '_');

  // Check if the model already exists
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }

  const companySchema = new mongoose.Schema({}, { strict: false });

  // Use the model name for collection under "masters"
  const CompanyModel = mongoose.connection.useDb('masters').model(modelName, companySchema);

  return CompanyModel;
};

module.exports = fileUploadModel;
