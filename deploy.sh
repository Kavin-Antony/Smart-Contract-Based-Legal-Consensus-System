#!/bin/bash

# Navigate to project root
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "======================================"
echo "🚀 Migrating Smart Contracts..."
echo "======================================"
truffle migrate --reset

echo ""
echo "======================================"
echo "📄 Copying new ABI to React Frontend..."
echo "======================================"
cp build/contracts/LawConsensus.json react-frontend/src/utils/

echo "✅ Done! React app is now synced with the latest smart contract."
