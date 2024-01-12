// Import necessary AWS SDK classes

import { config, S3 } from 'aws-sdk';
require('dotenv').config();

// Configure AWS SDK
config.update({
    accessKeyId: process.env.NEXT_USER_ACCESS_KEY,
    secretAccessKey: process.env.NEXT_USER_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Create an S3 instance
const s3 = new S3();


// Assuming `fetchJSONData` is already defined as per your provided code

 async function sessionUp(pageName, fileName, userData) {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${pageName}/${fileName}`,
        Body: userData,
        ContentType: 'application/json',
      };
    
      try {
        console.log("Successfully uploaded data to " + process.env.BUCKET_NAME + "/" + `${pageName}/${fileName}`);

        const data = await s3.putObject(params).promise();
        return data;
      } catch (error) {
        console.error("Error uploading data: ", error);
        throw error;
      }
}
export default { sessionUp };

// Usage example: updateJsonInS3(arrayOfIds);
