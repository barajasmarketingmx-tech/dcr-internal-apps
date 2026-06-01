export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    const employee = req.query.employee;

    if (!employee) {

      return res.status(400).json({
        error: "Employee parameter required"
      });

    }

    const BASE_ID = process.env.BASE_ID;
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

    if (!BASE_ID || !AIRTABLE_TOKEN) {

      return res.status(500).json({
        error: "Missing environment variables"
      });

    }

    const TABLE_NAME = "Tasks";

    const safeEmployee =
      employee.replace(/"/g, '\\"');

    const formula = `
      AND(
        FIND(
          LOWER("${safeEmployee}"),
          LOWER(ARRAYJOIN({Employee Names}))
        ),
        NOT({Completed})
      )
    `;

    const url =
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}` +
      `?filterByFormula=${encodeURIComponent(formula)}`;

    const response = await fetch(url, {

      method: "GET",

      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      }

    });

    if (!response.ok) {

      const errorText =
        await response.text();

      return res.status(response.status).json({
        error: "Airtable request failed",
        details: errorText
      });

    }

    const data =
      await response.json();

    return res.status(200).json(data);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Server error",
      details: error.message
    });

  }

}
