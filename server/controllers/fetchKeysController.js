const mongoose = require("mongoose");

const fetchKeysController = async(req,res) => {
    try {
        const {master} = req.body;
        console.log("master",master);

        // Access the 'masters' database
        const db = mongoose.connection.useDb('P4US_MASTERS');

        // Retrieve only the first document from the specified collection
        const firstDocument = await db.collection(master).findOne({});
        console.log("firstDocument:", firstDocument);

        // Get keys from the first document
        const keys = firstDocument ? Object.keys(firstDocument) : [];
        console.log("keys:", keys);

        res.status(200).json({ keys });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching data' });
        
    }
}

module.exports = {fetchKeysController}