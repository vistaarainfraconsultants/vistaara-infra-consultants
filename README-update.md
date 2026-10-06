# Vistaara Infra Consultants – Dynamic Projects & Careers Update

This package contains the complete updated `index.html`, `style.css`, and `script.js`, plus sample `/projects/` and `/careers/` JSON structures.

## Projects
Each project folder contains `project.json` and `cover.jpg`. The website reads `/projects/` from the GitHub Contents API, sorts by `order`, displays up to five `featured: true` projects at the top, and places the remaining projects in More Projects.

## Careers
Each position folder contains `job.json`. Positions are sorted by `order`; `status` controls OPEN/CLOSED styling. OPEN positions can expand details; CLOSED positions retain the current non-expandable behavior.

The five current featured project JSON files and the three current career positions are included. The existing five hard-coded More Portfolio entries still need their project folders, cover images, and complete project information before they can be migrated safely.
