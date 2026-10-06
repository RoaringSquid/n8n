const src = $('Only Unchecked Products').all();
const clean = (s) => String(s || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

// This workflow checks clothing. Accessories (bags, shoes, jewellery, homeware ...) are skipped, hats are kept
// because they are made of the same fabrics as clothes.
const accessoryCategory = /^(sacs|chaussures|bijoux|pop-up|ceintures?|lunettes|accessoires|maroquinerie|petite-maroquinerie|foulards?|echarpes?|gants|chaussettes|parfums?|maison)/i;
const accessoryType = /(tasche|taschen|rucksack|shopper|clutch|portemonnaie|geldbeutel|pumps|ballerinas?|mokassins?|hausschuhe?|stiefel|stiefelette|sandalen?|sneakers?|schuhe?|loafers?|boots?|armband|halskette|kette|ohrringe?|ring|brosche|g(ü|u)rtel|schal|tuch|handschuhe?|socken?|brille|tasse|teller|kerzenhalter|vase|schale)$/i;
const hat = /(^|[^a-z])(hat|cap|beanie|beret|bucket|bonnet|chapeau|casquette|bob|hut|mutze|muetze|m(ü|u)tze|kappe|baskenm(ü|u)tze)([^a-z]|$)/i;
const isAccessory = (shop, html, url, name, typeWord) => {
  const segs = url.split('/').filter(Boolean);
  const slug = (shop === 'Sessun' ? segs[segs.length - 1] : segs[segs.length - 2] || '').replace(/\.html$/, '').replace(/-/g, ' ');
  if (hat.test(slug) || hat.test(name) || hat.test(typeWord)) return false;
  if (shop === 'Sessun') {
    const c = (html.match(/"category":\s*"([^"]+)"/) || [])[1] || '';
    return accessoryCategory.test(c) || accessoryType.test(typeWord);
  }
  const c = (html.match(/"category":"([A-Za-z][^"]*\/[^"]*)"/) || [])[1] || '';
  return /\/Accessories/i.test(c);
};

const out = [];
$input.all().forEach((item, i) => {
  const meta = src[i] ? src[i].json : {};
  const html = String(item.json.data || '');
  let name = '';
  let typeWord = '';
  let materials = '';
  let extra = '';
  const t = html.match(/<title>([^<]*)<\/title>/i);
  if (t) {
    const parts = clean(t[1]).split('|');
    name = parts[0].trim();
    if (meta.shop === 'Sessun' && parts.length > 2) typeWord = (parts[1] || '').trim(); // e.g. "Tasche", "Kleid"
  }
  if (isAccessory(meta.shop, html, String(meta.product_url || ''), name, typeWord)) return; // not clothing
  if (meta.shop === 'Sessun') {
    const comps = [...html.matchAll(/<p class="composition">([\s\S]*?)<\/p>/gi)].map(m => clean(m[1]));
    materials = [...new Set(comps)].join(' | ');
    const d = html.match(/itemprop="description">([\s\S]*?)<\/div>/i);
    if (d) extra = clean(d[1]);
  } else {
    const mats = [...html.matchAll(/Material:<\/span>([\s\S]*?)<\/li>/gi)].map(m => clean(m[1]));
    materials = [...new Set(mats)].join(' | ');
    const certs = [...html.matchAll(/Certificate:<\/span>([\s\S]*?)<\/li>/gi)].map(m => clean(m[1]));
    const d = html.match(/"description":"([^"]*)"/);
    extra = [d ? d[1] : '', [...new Set(certs)].join(' | ')].filter(Boolean).join(' Certificates: ');
  }
  if (!materials) return; // page did not load or has no material info; retry next run
  out.push({ json: { shop: meta.shop, gender: meta.gender || '', product_url: meta.product_url, product_name: name, materials, details: extra.slice(0, 1500) } });
});
return out;
