#!/bin/sh
# HeroUI 시안을 다시 빌드한다 (React·HeroUI·Tailwind 4·esbuild가 필요 — 프로젝트 본체엔 없다)
#   npm i react react-dom @heroui/react @heroui/styles tailwindcss@4 @tailwindcss/cli@4 esbuild
cd "$(dirname "$0")"
npx esbuild main.jsx --bundle --minify --format=iife --jsx=automatic \
  --define:process.env.NODE_ENV='"production"' --outfile=../heroui.bundle.js
npx @tailwindcss/cli -i hero.in.css -o ../heroui.css --minify
