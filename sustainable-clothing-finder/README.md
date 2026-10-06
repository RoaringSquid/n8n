# Sustainable Clothing Finder

An n8n workflow that watches the "new in" pages of two fashion brands (Sessùn and Filippa K), reads each new clothing item's declared materials, and uses an LLM to decide whether the item is made **only** of sustainable materials. Results go to a Google Sheet, a per-run email summary and a dashboard.

## What it does

1. **Scheduled run**: every second Saturday at 08:00 (Europe/Berlin).
2. **Collect products**: Sessùn's paginated new-in list (pages 1–8) and Filippa K's women's and men's new-in grids. A product on both Filippa K lists is tagged `unisex`.
3. **Skip what is already known**: product URLs are compared with the Google Sheet, so each product is judged once.
4. **Read the product page**: composition, certificates and the description text. Accessories (bags, shoes, jewellery, homeware) are skipped; hats are kept because they are made of the same fabrics as clothes.
5. **Judge materials** with OpenAI `gpt-5-mini` through a structured output parser (`is_sustainable`, `fibre_highlight`, `assessment`).
6. **Save** each verdict to Google Sheets (upsert on `product_url`).
7. **Email a run summary**, grouped by brand (Filippa K further split into women's, men's and unisex), sustainable items first.
8. **Dashboard** (`dashboard.html`): the same results by brand, gender and run date.

## Judging rules

The prompt (`code/judge-prompt.txt`) encodes these decisions:

- Sustainable: cotton, wool, cashmere and alpaca of any kind; linen, hemp; yak and camel hair; TENCEL/lyocell; FSC or EcoVero viscose; recycled polyester or polyamide; certified mohair; organic silk; LWG-certified leather.
- Not sustainable: virgin polyester, polyamide, acrylic, elastane, conventional viscose or modal, PU/PVC, uncertified mohair.
- Any single non-sustainable declared material (even 2% elastane) fails the whole product. Unclassifiable materials fail it too.
- Trims and components the shop does not list never fail a product.
- `fibre_highlight` is a badge for the better kind of cotton, wool, cashmere or alpaca (organic, certified, recycled, mulesing-free), taken only from what the page states.

## Engineering notes

- **Filippa K "Load more"**: the workflow calls the shop's grid endpoint directly (`Search-UpdateGrid`, `sz=300`) instead of scraping the first 24 tiles.
- **Memory limits on n8n Cloud**: fetching ~270 product pages at once crashed the execution, so fetching is capped at 100 per run (`Max 100 To Fetch`), pages are fetched one at a time with a delay, and judging is capped at 80 per run.
- **Idempotent**: results are upserted on `product_url`, and products already in the sheet are never fetched again.
- **Cost control**: the LLM only sees products that are new and have a composition.

## Setup

1. In n8n, import `workflow.json`.
2. Create a Google Sheet with this header row in the first tab:
   `product_url, shop, gender, product_name, materials, is_sustainable, fibre_highlight, assessment, checked_at, run_date`
3. Select that sheet in **Read Checked Products** and **Save Result**, and connect your Google Sheets, OpenAI and Gmail credentials.
4. Set the recipient in **Email Run Summary**.
5. Run once manually to test, then activate the workflow.

The dashboard (`dashboard.html`) was built as a Claude artifact that reads the sheet through a Google Drive connector. Replace `YOUR_GOOGLE_SHEET_ID` in it, and adapt the data loading if you host it elsewhere.

## Files

| File | Purpose |
| --- | --- |
| `workflow.json` | Importable n8n workflow (credentials and personal values removed) |
| `code/` | The Code-node scripts and the judging prompt as readable files |
| `dashboard.html` | Dashboard source |

## Limitations

- Verdicts rely on what the product page declares; no external certificate lookup.
- Scraping depends on each shop's current page layout and may need updates if it changes.
