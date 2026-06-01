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
