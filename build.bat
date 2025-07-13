@echo off
echo Starting QuizCraft build...
set NODE_ENV=production
pnpm exec next build
echo Build completed!
pause