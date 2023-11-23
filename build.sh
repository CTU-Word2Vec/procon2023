# !/bin/bash

# Build the project
tsc && vite build

# Build document
npm run typedoc

# Copy document to dist
cp docs -r dist/
