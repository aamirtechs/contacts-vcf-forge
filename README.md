# Contacts VCF Forge
Live page: https://aamirtechs.github.io/contacts-vcf-forge/

Convert a contacts CSV or spreadsheet to a phone-ready .vcf with field mapping, duplicate merging and file splitting, with no contact limits and no upload of your address book. Built for sales and support staff, office admins and anyone switching phones.

## Features
- CSV and XLSX import with automatic plus manual field mapping for name, phones, emails, org, title, address and notes
- vCard 3.0 and 4.0 output as a single file or split chunks
- Duplicate detection and merge on phone or email
- Phone cleanup that strips spaces and keeps a leading plus or zero, with a problem-row report
- Download .vcf plus an exceptions CSV for rows that need fixing

## How it works
Upload a CSV or XLSX file or paste CSV, confirm the field mapping, choose vCard 3.0 or 4.0, review duplicates and problem rows, then download one .vcf or split chunks plus an exceptions CSV. It runs entirely in the browser.

## Privacy
Runs 100% in your browser. Your files never leave this device, nothing is uploaded, and there is no tracking.

## Development
Core logic lives in `src/logic.js` and is shared by the page and the tests. Run the tests with `npm test`.

## License
MIT, Copyright 2026 Amir Hussain.
