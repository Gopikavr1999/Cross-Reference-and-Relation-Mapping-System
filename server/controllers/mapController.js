const Fuse = require('fuse.js');
const mongoose = require('mongoose');

const mapController = async (req, res) => {
    try {
        const { master1, master2, key1, key2 } = req.body;
        const db = mongoose.connection.useDb('P4US_MASTERS');
        const batchSize = 100;  // Define batch size

        let data1Skip = 0;
        let data1Batch;
        let data1BatchCount = 0;

        do {
            // Fetch next batch of data1
            data1Batch = await db.collection(master1)
                .find({})
                .skip(data1Skip)
                .limit(batchSize)
                .toArray();
            data1Skip += batchSize;
            data1BatchCount++;
            console.log("data1Batch",data1Batch);

            console.log(`Processing data1 batch ${data1BatchCount}, ${data1Batch.length} items`);     

            // Process each batch of data1
            for (const batchItem of data1Batch) {
                const kv1 = { [key1]: batchItem[key1], _id: batchItem._id };
                
                let data2Skip = 0;
                let data2Batch;
                const matchedUpdates = [];  // To store bulk updates for matched documents
                
                do {
                    // Fetch next batch of data2
                    data2Batch = await db.collection(master2)
                        .find({}, { projection: { [key2]: 1, _id: 1 } })
                        .skip(data2Skip)
                        .limit(batchSize)
                        .toArray();
                    data2Skip += batchSize;

                    // Initialize Fuse once per data2 batch for efficiency
                    const fuse = new Fuse(data2Batch, { keys: [key2], threshold: 0.5 });
                    
                    // Perform Fuse search
                    const results = fuse.search(kv1[key1]);
                    const matchedIds = results.length > 0 ? results.map(res => res.item._id) : [""];

                    for (const matchedId of matchedIds) {
                        if (!matchedId) continue;  // Skip if no match
                        
                        // Prepare bulk update operations to be performed once per batch
                        matchedUpdates.push({
                            updateOne: {
                                filter: { _id: matchedId },
                                update: {
                                    $addToSet: { [key1]: kv1[key1] || "" }
                                }
                            }
                        });
                    }
                } while (data2Batch.length === batchSize);  // Continue while data2Batch has records
                
                // Execute bulk write on matched documents to reduce MongoDB calls
                if (matchedUpdates.length > 0) {
                    await db.collection(master2).bulkWrite(matchedUpdates);
                    console.log(`Batch update completed for ${matchedUpdates.length} matched documents.`);
                }
            }
        } while (data1Batch.length === batchSize);  // Continue while data1Batch has records
         console.log("Finished!!!");
        
        res.status(200).json({ message: 'Data processed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing data' });
    }
};

module.exports = { mapController };

// const Fuse = require('fuse.js');
// const mongoose = require('mongoose');

// const mapController = async (req, res) => {
//     try {
//         const { master1, master2, key1, key2 } = req.body;
//         const db = mongoose.connection.useDb('masters');

//         const data1Cursor = db.collection(master1).find({});

//         // Set up Fuse.js options and initialize Fuse only with essential fields
//         const data2 = await db.collection(master2).find({}, { projection: { [key2]: 1, _id: 1 } }).toArray();
//         const fuse = new Fuse(data2, { keys: [key2], threshold: 0.5 });

//         // Process data1 in batches
//         while (await data1Cursor.hasNext()) {
//             const batch = await data1Cursor.next();
//             const kv1 = { [key1]: batch[key1], _id: batch._id };

//             // Search for matches using Fuse.js
//             const results = fuse.search(kv1[key1]);
//             const matchedIds = results.map(res => res.item._id);

//             for (const matchedId of matchedIds) {
//                 const existingDoc = await db.collection(master2).findOne({ _id: matchedId });

//                 // Ensure key1 is an array in matched document
//                 if (!Array.isArray(existingDoc[key1])) {
//                     await db.collection(master2).updateOne(
//                         { _id: matchedId },
//                         { $set: { [key1]: existingDoc[key1] ? [existingDoc[key1]] : [] } }
//                     );
//                 }

//                 // Add kv1[key1] to the array if it's non-null and unique
//                 if (kv1[key1]) {
//                     await db.collection(master2).updateOne(
//                         { _id: matchedId },
//                         { $addToSet: { [key1]: kv1[key1] } }
//                     );
//                 }
//                 console.log(`Updated document ID ${matchedId} with ${key1}: ${kv1[key1]}`);
//             }
//         }

//         // Close the cursor after processing
//         await data1Cursor.close();

//         res.status(200).json({ message: 'Data processed successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred while processing data' });
//     }
// };

// module.exports = { mapController };


