const mongoose = require("mongoose");
const csvtojson = require("csvtojson");

// Function to clean the file name by replacing spaces with underscores
function cleanFileName(fileName) {
    return fileName.replace(/\s+/g, '_');
}

const fileUploadController = async (req, res) => {
    console.log("hii");

    const fileNameWithExtension = req.file.originalname; // Extract the original file name
    const fileName = fileNameWithExtension.replace(/\.[^/.]+$/, ""); // Remove the file extension
    const cleanedFileName = cleanFileName(fileName);

    // Use the "P4US_MASTERS" database and create a collection with the cleaned file name
    const checkMasterDb = mongoose.connection.useDb('P4US_MASTERS', { useCache: false });
    const collection = checkMasterDb.collection(cleanedFileName);

    const csvFilePath = req.file.path;
    const jsonArray = await csvtojson().fromFile(csvFilePath);
    console.log("jsonArray", jsonArray);
    console.log("File uploaded and data stored successfully.");

    // Save data to the collection under "masters"
    await collection.insertMany(jsonArray, { ordered: false });
    res.status(200).json({
        message: "File uploaded and data stored successfully.",
    });
};

module.exports = { fileUploadController };
