const mongoose = require("mongoose");

const fetchCollectionNameController = async (req,res) => {
    try {
        console.log("helo");
         
        // Connect to the 'masters' database
        const db = mongoose.connection.db;

        // Fetch all collections from the 'masters' database
        const collections = await db.listCollections().toArray();

        // Extract collection names
        const collectionNames = collections.map(collection => collection.name);

        console.log("Collection Names:", collectionNames);
        res.status(200).json(collectionNames);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {fetchCollectionNameController}