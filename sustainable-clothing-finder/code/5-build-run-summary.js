// Builds one email for the whole run: per brand, sustainable items first, then not sustainable.
// Filippa K is split into Women / Men / Unisex sections, like the dashboard.
const DASHBOARD_URL = ''; // optional: link to your dashboard
const judged = $('Judge Materials').all();
const meta = $('Max 80 Per Run').all();
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rows = judged.map((j, i) => {
  const m = meta[i] ? meta[i].json : {};
  const o = j.json.output || {};
  return { shop: m.shop || '', gender: m.gender || '', name: m.product_name || '', url: m.product_url || '', materials: m.materials || '', ok: o.is_sustainable === true || o.is_sustainable === 'true', fibre: o.fibre_highlight || '', note: o.assessment || '' };
}).filter(r => r.url);
if (!rows.length) return [];

const verdictBlocks = (list, showGender) => {
  const block = (title, items, colour) => {
    if (!items.length) return `<p style="color:#666;margin:4px 0 14px">${title}: none this run</p>`;
    const lines = items.sort((a, b) => a.name.localeCompare(b.name)).map(r => {
      const tag = [showGender ? r.gender : '', r.fibre].filter(Boolean).map(esc).join(' · ');
      return `<li style="margin:5px 0"><a href="${esc(r.url)}">${esc(r.name)}</a>${tag ? ` <span style="color:#666">(${tag})</span>` : ''}<br><span style="color:#555;font-size:13px">${esc(r.materials)}</span></li>`;
    }).join('');
    return `<h3 style="margin:14px 0 4px;color:${colour}">${title} (${items.length})</h3><ul style="padding-left:18px;margin:0">${lines}</ul>`;
  };
  return block('Sustainable', list.filter(r => r.ok), '#2e7d32') + block('Not sustainable', list.filter(r => !r.ok), '#b3261e');
};

const brandHtml = (shop) => {
  const mine = rows.filter(r => r.shop === shop);
  if (!mine.length) return '';
  let body = '';
  if (shop === 'Filippa K') {
    const groups = [['female', 'Women'], ['male', 'Men'], ['unisex', 'Unisex']];
    const known = groups.map(g => g[0]);
    groups.forEach(([key, title]) => {
      const l = mine.filter(r => r.gender === key);
      if (l.length) body += `<h2 style="margin:22px 0 0;font-size:18px">${title} <span style="color:#666;font-weight:normal;font-size:14px">${l.filter(r => r.ok).length} of ${l.length} pass</span></h2>` + verdictBlocks(l, false);
    });
    const rest = mine.filter(r => !known.includes(r.gender));
    if (rest.length) body += `<h2 style="margin:22px 0 0;font-size:18px">Other</h2>` + verdictBlocks(rest, false);
  } else {
    body = verdictBlocks(mine, true);
  }
  return `<h2 style="border-bottom:1px solid #ddd;padding-bottom:4px;margin-top:28px">${esc(shop)}</h2>` + body;
};

const today = new Date().toISOString().slice(0, 10);
const total = rows.length;
const yes = rows.filter(r => r.ok).length;
const html = `<div style="font-family:Arial,sans-serif;max-width:720px">` +
  `<h1 style="margin-bottom:2px">Sustainable Clothing Finder</h1>` +
  `<p style="color:#555;margin-top:0">${today}: ${total} new products checked, ${yes} sustainable.` +
  (DASHBOARD_URL ? ` <a href="${esc(DASHBOARD_URL)}">Open dashboard</a>` : '') + `</p>` +
  brandHtml('Sessun') + brandHtml('Filippa K') + `</div>`;
return [{ json: { subject: `Sustainable clothing: ${yes} of ${total} new products pass (${today})`, html, total, yes } }];
