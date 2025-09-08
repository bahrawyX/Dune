@echo off
start cmd /k "npm run dev"
start cmd /k "docker compose up"
start cmd /k "npm run db:studio"
start cmd /k "npx inngest-cli@latest dev"
