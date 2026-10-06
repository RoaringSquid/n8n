const pages = $('Shop Listing Pages').all();
const found = new Map(); // product_url -> { shop, genders }
const base = 'https://www.filippa-k.com';
const absolute = (u) => (u.startsWith('http') ? u : base + u);
const fkLink = /href="((?:https:\/\/www\.filippa-k\.com)?\/de\/en\/[a-z0-9-]+\/[0-9]{5}-[0-9]{4}\.html)"/;

// Filippa K: the listing comes from the shop's grid endpoint (the one behind "Load more items"),
// which returns every new-in tile in one go. One tile = one product (colour); take each tile's own link.
const tileProducts = (html) => {
  const urls = [];
  for (const part of html.split(/<[^>]*class="product-tile"[^>]*>/).slice(1)) {
    const m = part.match(fkLink);
    if (m) urls.push(absolute(m[1]));
  }
  return urls;
};

const add = (url, shop, gender) => {
  if (!found.has(url)) found.set(url, { shop, genders: new Set() });
  if (gender) found.get(url).genders.add(gender);
};

$input.all().forEach((item, i) => {
  const shop = pages[i] ? pages[i].json.shop : '';
  const gender = pages[i] ? pages[i].json.gender : '';
  const html = String(item.json.data || '');
  if (shop === 'Sessun') {
    const re = /href="(https:\/\/de\.sessun\.com\/catalogue\/[a-z0-9-]+\/[a-z0-9-]+\.html)"/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      const url = m[1];
      // skip size-variant duplicates like ...-m.html or ...-38.html
      if (/-(xxs|xs|s|m|l|xl|xxl|tu|[0-9]{2})\.html$/.test(url)) continue;
      if (/\/catalogue\/(taschen|schmuck|schuhe|accessoires)\//.test(url)) continue;
      add(url, shop, gender);
    }
  } else {
    const listed = tileProducts(html);
    if (listed.length) {
      new Set(listed).forEach(u => add(u, shop, gender));
    } else {
      // layout changed: keep every product link but leave gender blank rather than guess
      const re = new RegExp(fkLink.source, 'g');
      new Set([...html.matchAll(re)].map(m => absolute(m[1]))).forEach(u => add(u, shop, ''));
    }
  }
});

// a product found on both the women's and the men's list is unisex
return [...found].map(([product_url, v]) => ({
  json: { shop: v.shop, product_url, gender: v.genders.size > 1 ? 'unisex' : ([...v.genders][0] || '') }
}));
