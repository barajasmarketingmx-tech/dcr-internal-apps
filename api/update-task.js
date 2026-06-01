export default async function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { recordId, status } = req.body;

    if (!recordId || !status) {

      return res.status(400).json({
        error: "recordId and status are required"
      });

    }

    const BASE_ID = process.env.BASE_ID;
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

    const TABLE_NAME = "Tasks";

    const airtableUrl =
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}/${recordId}`;

    const response = await fetch(airtableUrl, {

      method: "PATCH",

      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        fields: {
          Status: status
        }
      })

    });

    const data = await response.json();

    if (!response.ok) {

      return res.status(response.status).json({
        error: "Airtable update failed",
        details: data
      });

    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      record: data
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });

  }

}
