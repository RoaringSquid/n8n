// Rows already saved in the Google Sheet (empty sheet gives one blank item)
const checked = new Set(
  $input.all()
    .map(i => String(i.json.product_url || '').trim())
    .filter(Boolean)
);
// Keep only product links that are not in the sheet yet
return $('Extract Product Links').all().filter(i => !checked.has(String(i.json.product_url || '').trim()));
