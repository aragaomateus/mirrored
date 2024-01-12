const { uploadJSONToS3 } = require('./updateJSON');

const pageName = 'user-profile';
const fileName = 'user-data.json';
const userData = {
  username: 'johndoe',
  preferences: {
    theme: 'dark',
  },
};

// Call the helper function to upload the data to S3
uploadJSONToS3(pageName, fileName, userData)

