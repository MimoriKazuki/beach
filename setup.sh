#!/bin/bash

# Create Next.js app with specific configuration
npx create-next-app@latest beach-volleyball-app \
  --typescript \
  --app \
  --tailwind \
  --no-src-dir \
  --import-alias "@/*" \
  --eslint \
  --turbopack \
  --no-git

cd beach-volleyball-app

# Install additional dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install next-pwa
npm install lucide-react
npm install -D @types/node

# Install shadcn/ui
npx shadcn@latest init -y --defaults

echo "Project setup complete!"