const Fuse = require("fuse.js");
const mongoose = require("mongoose");

const removeDuplicateID = async (req, res) => {
    try {
        const { master2, key1, key2 } = req.body;
        console.log({ master2, key1, key2 });

        // Access the 'masters' database
        const db = mongoose.connection.useDb('P4US_MASTERS');

        // Fetch aggregated data
        const data = await db.collection(master2).aggregate([
            {
                $group: {
                    _id: `$${key1}`, // Group by key1
                    [key2]: { $addToSet: `$${key2}` } // Collect unique key2 values
                }
            },
            {
                $project: {
                    [key1]: "$_id", // Rename _id to key1
                    [key2]: 1, // Include the key2 array
                    _id: 0 // Exclude the default _id field
                }
            }
        ]).toArray();

        console.log("Aggregated data:", data);

        for (const item of data) {
            const dynamicKey1Values = [item[key1]]; // Ensure dynamicKey1Values is an array
            const dynamicKey2Values = item[key2];
            
            console.log(`${key1}:`, dynamicKey1Values, `${key2}:`, dynamicKey2Values);

            // Skip processing if key1 values are null, undefined, empty, or falsy
            if (!dynamicKey1Values[0] || dynamicKey1Values[0].trim() === "") {
                console.log(`Skipping item because ${key1} is null, undefined, or empty:`);
                continue;
            }

            // Prepare Fuse.js instance with key2 values
            const fuse = new Fuse(dynamicKey2Values, {
                includeScore: true,
                threshold: 0.5, // Match threshold
                keys: [] // Plain string array, no keys required
            });

            // Perform the search for dynamicKey1Values in dynamicKey2Values
            const searchResults = dynamicKey1Values.flatMap((value) =>
                fuse.search(value)
            );

            console.log("Search results:", searchResults);

            // Format search results
            const formattedMatches = searchResults.map((result) => ({
                [key2]: result.item, // Matched item
                matchScore: result.score
            }));

            console.log("Formatted matches:", formattedMatches);

            // Find the most relevant match
            const mostMatched = formattedMatches.reduce((best, current) =>
                current.matchScore < best.matchScore ? current : best
            , formattedMatches[0]);

            if (mostMatched) {
                console.log("Most matched item:", mostMatched);

                // Remove other key1 values from matching documents
                const otherKey1Values = dynamicKey2Values.filter(
                    (id) => id !== mostMatched[key2]
                );

                console.log("Other key1 values to update:", otherKey1Values);

                if (otherKey1Values.length > 0) {
                    await db.collection(master2).updateMany(
                        { [key2]: { $in: otherKey1Values } },
                        { $unset: { [key1]: "" } } // Remove the key1 field
                    );

                    console.log(
                        `Removed ${key1} from documents with ${key2} values:`,
                        otherKey1Values
                    );
                }
            }
        }
        console.log("Final Step Completed ...........");
        
        res.status(200).json({ message: "Duplicate IDs removed successfully." });
    } catch (error) {
        console.error("Error in removeDuplicateID:", error);
        res.status(500).json({ message: "An error occurred.", error });
    }
};

module.exports = { removeDuplicateID };
