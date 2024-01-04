// utils/fetchCsv.js
// utils/fetchJson.js
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const bucketName = process.env.BUCKET_NAME
const objectKey = process.env.OBJECT_KEY

const s3Client = new S3Client({
  region: process.env.AWS_REGION, // or the specific region your bucket is in
  credentials: {
    accessKeyId: process.env.NEXT_USER_ACCESS_KEY,
    secretAccessKey: process.env.NEXT_USER_SECRET_ACCESS_KEY
  }
});

// Helper function to convert a stream into a string
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    let data = '';
    stream.on('data', chunk => data += chunk);
    stream.on('end', () => resolve(data));
    stream.on('error', reject);
  });
}

 export async function fetchJSONData() {
  const getObjectParams = {
    Bucket: bucketName,
    Key: objectKey
  };

  try {
    const command = new GetObjectCommand(getObjectParams);
    const response = await s3Client.send(command);

    if (response) {
   
        // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
        const str = await response.Body.transformToString();
        return str
    } else {
      throw new Error('Empty response body');
    }
  } catch (error) {
    console.error('Error fetching JSON data from S3:', error);
    throw error;
  }
}
