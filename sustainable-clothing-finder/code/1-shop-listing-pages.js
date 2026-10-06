// Sessun: the new-in list is paginated (?p=1, 2, 3 ...). It had 4 pages (~70 products) when checked;
// pages past the end come back empty, so a few spare pages are fetched to cover growth.
const sessunPages = [1, 2, 3, 4, 5, 6, 7, 8].map(p => ({
  json: { shop: 'Sessun', gender: 'female', listing_url: `https://de.sessun.com/catalogue/neuheiten.html?p=${p}` },
}));

return [
  ...sessunPages,
  // Filippa K: the grid endpoint behind the "Load more items" button; sz=300 returns every new-in item in one request.
  { json: { shop: 'Filippa K', gender: 'female', listing_url: 'https://www.filippa-k.com/on/demandware.store/Sites-FilippaK-Site/en_DE/Search-UpdateGrid?cgid=woman-new-in&start=0&sz=300' } },
  { json: { shop: 'Filippa K', gender: 'male', listing_url: 'https://www.filippa-k.com/on/demandware.store/Sites-FilippaK-Site/en_DE/Search-UpdateGrid?cgid=man-new-in&start=0&sz=300' } },
];
