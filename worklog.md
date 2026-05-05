---
Task ID: 1
Agent: Main
Task: Fix critical bugs and continue TiendaApp development

Work Log:
- Restored /api/upload route (was accidentally deleted)
- Fixed CORS: added tienda.blackboxperu.com and blackboxperu.com to allowed origins
- Created POST /api/payments/submit endpoint for manual Yape/Transfer voucher submission
- Updated PlanManager to call /api/payments/submit instead of webhook PUT endpoint
- Replaced all PLANS mock-data imports with API fetches (StoreWizard, DashboardOverview, Sidebar, AdminSettings)
- Replaced all CATEGORIES mock-data imports with inline constants (7 files)
- Moved TESTIMONIALS to dedicated landing-testimonials.ts
- Verified build passes successfully
- Verified plans exist in DB (free, pro, premium)
- Verified deployed app health check passes all checks
- Pushed 3 commits to GitHub

Stage Summary:
- Payment flow now works: user selects plan → sees Yape/Transfer info → submits voucher number → payment saved as "pending" for admin verification
- Zero mock-data imports remain in active components
- App deployed and healthy at https://tienda.blackboxperu.com
- Git: 3 commits pushed (4cc1de1, 1ac89dd)
