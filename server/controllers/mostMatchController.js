const Fuse = require("fuse.js");
const fileUploadModel = require("../models/fileUploadModel");
const mongoose = require('mongoose');

const mostMatchController = async (req,res)=> {
    try {
        const {master2,key1,key2} = req.body;
        console.log("master2,key1,key2",master2,key1,key2);

        const db = mongoose.connection.useDb('P4US_MASTERS');


        // Use fileUploadModel to dynamically get the Master2 model
        const Masters = db.collection(master2)

        // Construct the query and projection dynamically based on input keys
        const query = { [key2]: { $exists: true } }; // Adjust if you need specific values
        const projection = { [key1]: 1, [key2]: 1 };

        // Fetch documents that match key2 and retrieve key1 data
        const results = await Masters.find(query, { projection }).toArray();

        console.log("Results:", results);
          // Set up Fuse.js options for fuzzy searching
          const fuseOptions = {
            includeScore: true,
            threshold: 0.5,  // Adjust threshold for match sensitivity
            keys: [key1]
        };
        console.log("fuseOptions",fuseOptions);

        const matches = [];

        // Use a for...of loop to handle asynchronous operations properly
        for (const document of results) {
            // Check if document[key1] exists
            if (!document[key1]) {
                console.log(`Skipping document with _id: ${document._id} because ${key1} is not present.`);
                continue; // Skip this document
            }
            // Check if the value of document[key1] is a single value (not iterable)
            if (typeof document[key1] !== 'object' || !Array.isArray(document[key1])) {
                console.log(`Skipping document with _id: ${document._id} because ${key1} is a single value.`);
                continue; // Skip this document
            }
            console.log("Document:", document);
            console.log("Key1:", key1);
            console.log("Document[key1]:", document[key1]);
                        
            // Instantiate Fuse for each document's `key1` field as the search list
            const fuse = new Fuse(document[key1], fuseOptions);
            const key2Value = document[key2];
            console.log("key2Value",key2Value);
            
            let matchResults = fuse.search(key2Value);
            console.log("Initial matchResults:", matchResults);

            if (matchResults.length === 0) {
                console.log(`No matches found for document with _id: ${document._id}. Retrying with a higher threshold.`);

                // Update fuseOptions with a new threshold
                const fallbackFuseOptions = { ...fuseOptions, threshold: 0.6 };
                const fallbackFuse = new Fuse(document[key1], fallbackFuseOptions);

                // Retry search
                matchResults = fallbackFuse.search(key2Value);
                console.log("Fallback matchResults:", matchResults);

                if (matchResults.length === 0) {
                    console.log(`No matches found even after fallback for document with _id: ${document._id}. Removing ${key1}.`);
                    // Update fuseOptions with a new threshold
                    const latestFuseOptions = { ...fuseOptions, threshold: 0.6 };
                    const latestFuse = new Fuse(document[key1], latestFuseOptions);

                    // Retry search
                    matchResults = latestFuse.search(key2Value);
                    console.log("Latest matchResults:", matchResults);

                    if (matchResults.length === 0) {
                        console.log(`No matches found even after fallback for document with _id: ${document._id}. Removing ${key1}.`);
    
                        try {
                            await Masters.updateOne(
                                { _id: document._id },
                                { $unset: { [key1]: "" } }
                            );
                            console.log(`Removed ${key1} from document with _id: ${document._id}`);
                        } catch (unsetError) {
                            console.error(`Error removing ${key1} for document with _id: ${document._id}`, unsetError);
                        }
                    }
                }
            }

            // Initialize bestMatch variable
            let bestMatch = null;

             // Check for the highest score in matchResults
             if (matchResults.length > 0) {
                bestMatch = matchResults.reduce((max, result) => {
                    return (result.score < max.score) ? result : max; // Find the lowest score (best match)
                });

                console.log("Best Match:", bestMatch);

                // Update the database with the best match
                try {
                    await Masters.updateOne(
                        { _id: document._id },
                        {
                            $set: {
                                [key1]: bestMatch.item, // Set as a string
                            }
                        }
                    );

                    console.log(`Updated Document with _id: ${document._id}`);
                } catch (updateError) {
                    console.error(`Error updating document with _id: ${document._id}`, updateError);
                }

                matches.push({
                    _id: document._id,
                    bestMatch: bestMatch.item,
                    matchScore: bestMatch.score
                });
            } else {
                console.log("No matches found for document with _id:", document._id);
            }
            
        };

        console.log("Most Match Done.....");
        
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

module.exports = {mostMatchController}