export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    if (req.method !== "PATCH") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { recordId, Status } = req.body;

    if (!recordId || !Status) {
      return res.status(400).json({
        error: "Missing recordId or Status"
      });
    }

    const BASE_ID = process.env.BASE_ID;
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

    const url =
      `https://api.airtable.com/v0/${BASE_ID}/Tasks/${recordId}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: {
          Status: Status
        }
      })
    });

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }
}
