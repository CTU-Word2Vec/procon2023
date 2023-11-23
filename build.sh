# !/bin/bash

# Build the project
tsc && vite build

# Build document
npm run typedoc
