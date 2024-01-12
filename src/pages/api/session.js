// pages/api/session.js
// const { uploadJSONToS3 } = require('../../utils/updateJSON');

const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

require('dotenv').config();
const { v4: uuidv4 } = require('uuid');


const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_USER_ACCESS_KEY,
    secretAccessKey: process.env.NEXT_USER_SECRET_ACCESS_KEY
  }
});

async function uploadEvent(pageName, fileName, userData) {
    try {
        const userDataString = JSON.stringify(userData);

        // Prepare parameters to upload the updated JSON
        const putObjectParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: `${pageName}/${fileName}`,
            Body: userDataString,
            ContentType: 'application/json'
        };

        // Upload the updated JSON to S3
        await s3Client.send(new PutObjectCommand(putObjectParams));
        console.log(`Successfully uploaded data to ${process.env.BUCKET_NAME}/${pageName}/${fileName}`);

    } catch (error) {
        console.error('Error updating JSON data in S3:', error);
    }
}


export default async function handler(req, res) {
    if (req.method === 'PUT') {
      try {
        // Extract the session data from the request body
        console.log(req.body)
        const sessionData = req.body.data;
  
        // TODO: Add logic to store sessionData in your database
  
        // Send a response back to the client

        const pageName = req.body.page;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Replace ':' and '.' to make it filename safe
        // const uniqueId = uuidv4(); // Generate a unique identifier
        const fileName = `${pageName}_${timestamp}.json`;

        console.log(fileName)
        await uploadEvent(pageName, fileName, sessionData)


        res.status(200).json({ success: true, message: 'Session data recorded successfully.' });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error recording session data', error: error.message });
      }
    } else {
      // Handle any other HTTP methods
      res.setHeader('Allow', ['PUT']);
      res.status(405).end(`Method ${req.method} not allowed`);
    }
  }
  