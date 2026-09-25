# 79 Chemin Musie — image and product-link audit

**Audit date:** 2026-09-25  
**Source:** 23-page Kitchen v.4 PDF extraction

## Improvements made

- Preserved all 57 source PNG images and all original extraction metadata.
- Rebuilt the gallery with **57 higher-resolution WebP previews** (up to 1000 × 760 px) instead of the small original thumbnails.
- Reduced the working product list from **33 PDF link annotations to 27 unique products/URLs** while preserving the 33-row original CSV.
- Removed advertising, Google Shopping, UTM, recommendation and other nonessential tracking parameters from working URLs.
- Replaced retail links with manufacturer-direct links where a current, exact product page could be identified (including DeerValley, Sinkology and Café appliances).
- Kept the original PDF URL beside every curated link for traceability.
- Reworked `index.html` for phone use: product cards, larger touch targets, horizontal category navigation and no external JavaScript.

## Link audit result

- **22 of 27** preferred links were validated against current web pages during this audit.
- **5 of 27** were canonicalized but could not be conclusively validated by the automated crawler (Amazon, Etsy and/or Centura restrictions). These are marked in the HTML and CSV rather than being presented as verified.

## Important product-link corrections

- DeerValley workstation sink now points to the manufacturer page for **DV-1K0068**.
- DeerValley 33 × 18 Eclipse option now points to the manufacturer page for **DV-1K028**.
- Sinkology Turner now points to the exact **SK405-33FC** manufacturer page.
- Sinkology Parker now points to the exact **SK453-34FC** double-bowl manufacturer page.
- Café range and refrigerator alternatives now point to the official Café Appliances Canada pages rather than ad-heavy retailer URLs.
- Delta **1930-CZ-DST** RO/beverage faucet now points to Delta Canada.
- Amazon/Etsy links were reduced to stable canonical product/listing URLs.

## Image strategy

The source PDF already contains many high-resolution images, so AI upscaling the originals would add little value and could alter product finishes or drawings. The safer improvement was to leave the source PNGs intact and create sharper responsive previews for browsing. If a particular product image needs replacement, use the manufacturer page identified in `product_links_enhanced.csv` as the reference source.
