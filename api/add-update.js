export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { recordId, text, user } = req.body;

    if (!recordId || !text) {
      return res.status(400).json({
        error: "Missing recordId or text"
      });
    }

    const BASE_ID = process.env.BASE_ID;
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

    const url = `https://api.airtable.com/v0/${BASE_ID}/Tasks/${recordId}`;

    // 1. GET current updates
    const getRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    const data = await getRes.json();

    let updates = [];

    try {
      updates = JSON.parse(data.fields["Status Updates"] || "[]");
    } catch (e) {
      updates = [];
    }

    // 2. new update object
    const newUpdate = {
      text: text,
      date: new Date().toISOString().split("T")[0],
      user: user || "Unknown"
    };

    updates.push(newUpdate);

    // 3. save back
    const patchRes = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: {
          "Status Updates": JSON.stringify(updates)
        }
      })
    });

    const result = await patchRes.json();

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
