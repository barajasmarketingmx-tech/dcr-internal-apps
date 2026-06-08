export default async function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { recordId, text, user } = req.body;

    if (!recordId || !text) {
      return res.status(400).json({ error: "Missing recordId or text" });
    }

    const BASE_ID = process.env.BASE_ID;
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

    const url = `https://api.airtable.com/v0/${BASE_ID}/Tasks/${recordId}`;

    // 1. GET current task
    const getRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    const data = await getRes.json();

    if (!data || !data.fields) {
      return res.status(404).json({ error: "Task not found" });
    }

    // 2. SAFE existing value (HTML STRING SYSTEM)
    let existing = data.fields["Status Updates"] || "";

   // 3. APPEND safely
const updated = existing + text;

    // 5. PATCH Airtable
    const patchRes = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: {
          "Status Updates": updated
        }
      })
    });

    const result = await patchRes.json();

    if (result.error) {
      return res.status(500).json(result);
    }

    return res.status(200).json({
      success: true,
      recordId,
      updatedField: "Status Updates"
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
