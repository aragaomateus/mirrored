// Import necessary AWS SDK classes
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const {fetchJSONData} = require('./fetchJSON')
const {calculateAverageAudioFeatures} = require('./spotifyAPI')
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_USER_ACCESS_KEY,
    secretAccessKey: process.env.NEXT_USER_SECRET_ACCESS_KEY
  }
});

// Assuming `fetchJSONData` is already defined as per your provided code

export async function updateJsonInS3(ids) {
    try {
        // Fetch current JSON data from S3
        const currentJsonStr = await fetchJSONData();
        const currentJsonObj = JSON.parse(currentJsonStr);

        let count = 0;
        for (const id of ids) {
        if (!currentJsonObj.hasOwnProperty(id)) {
            // Calculate the new averages (assuming calculateAverageAudioFeatures is defined)
            const avgs = await calculateAverageAudioFeatures(id);
            console.log(avgs);

            // Update the JSON object
            currentJsonObj[id] = avgs;
            count += 1;
        }
        }

        if (count > 0) {
        // Convert the updated JSON object back to a string
        const updatedJsonStr = JSON.stringify(currentJsonObj);

        // Prepare parameters to upload the updated JSON
        const putObjectParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: process.env.OBJECT_KEY,
            Body: updatedJsonStr,
            ContentType: 'application/json'
        };

        // Upload the updated JSON to S3
        await s3Client.send(new PutObjectCommand(putObjectParams));
        console.log('JSON updated successfully in S3');
        } else {
        console.log('No new data to update');
        }
    } catch (error) {
        console.error('Error updating JSON data in S3:', error);
    }
}

// Usage example: updateJsonInS3(arrayOfIds);
