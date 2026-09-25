# Kitchen Studio

Static GitHub Pages app for the kitchen design. `index.html` is the entry point; the current V.4 cabinet box schedule is in `data/cabinets.js`. `css/studio.css` and `js/` contain the existing interactive runtime and integrations. No build step is required.

The drawing PDF and current budget remain the purchasing authority. The elevation and main 3D cabinet builder share V.4 box widths, heights and wall positions; depths, clearances and the corner remain visual approximations. Decisions, working edits and concepts persist in browser storage and can be exported. The published site includes personal project details and prices.

To preview locally, run `python3 -m http.server 8000` in this directory and open `http://localhost:8000/`.
