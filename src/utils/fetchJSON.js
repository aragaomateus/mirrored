// utils/fetchCsv.js
export async function fetchCsvData() {
    const baseUrl = `https://${process.env.VERCEL_URL}`  || 'http://localhost:3000'; // Fallback for local development
    const response = await fetch(`${baseUrl}/artist_avg_features.json`);
    if (!response.ok) {
        throw new Error('Failed to fetch the file');
    }
    const text = await response.text();
    // Process the CSV text as needed
    return text;
}
