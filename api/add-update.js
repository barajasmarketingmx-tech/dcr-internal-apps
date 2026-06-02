export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {

    const { recordId, text, user } = req.body;

    if (!recordId || !text) {
      return res.status(400).json({ error: "Missing data" });
    }

    const BASE_ID = process.env.BASE_ID;
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

    const url = `https://api.airtable.com/v0/${BASE_ID}/Tasks/${recordId}`;

    // 1. GET current record
    const getRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    const data = await getRes.json();

    let existing = data.fields["Status Updates"] || "";

    // 2. clean HTML entry (ONLY HTML, NO JSON)
    const date = new Date().toLocaleDateString();

    const newEntry = `<br><br><b>${date}</b> - <i>${text}</i>`;

    // 3. append safely
    const updated = existing + newEntry;

    // 4. save back
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

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
