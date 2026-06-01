export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    const BASE_ID = process.env.BASE_ID;
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/Projects`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }

}
