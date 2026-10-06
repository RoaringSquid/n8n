# n8n

A collection of n8n automation projects.

## Projects

### [Sustainable Clothing Finder](./sustainable-clothing-finder)

An automated workflow that monitors the "new in" pages of two fashion brands, Sessùn and Filippa K, and uses an LLM to decide which new clothing items are made only of sustainable materials.

Every second Saturday it collects the new arrivals (including paginated and "load more" listings), skips anything already checked, reads each product's declared composition and certificates, and has OpenAI `gpt-5-mini` return a structured verdict with a short explanation and a badge for better-grade fibres (organic or certified cotton, certified or recycled wool, and so on). Results are stored in Google Sheets, emailed as a run summary grouped by brand and gender, and shown on a dashboard.

**Tech:** n8n, OpenAI (structured output), Google Sheets, Gmail, JavaScript Code nodes, web scraping.

**Highlights:** reverse-engineered the shop's "load more" endpoint to get full listings; de-duplication against the sheet so each product is judged once; memory-aware batching to keep n8n Cloud executions stable; a written, adjustable rulebook for what counts as sustainable.
