#!/bin/bash

echo "================================"
echo "  Backend Setup Script"
echo "================================"
echo ""

# Install dependencies
echo "[1/4] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "Error: Failed to install dependencies"
  exit 1
fi
echo "Dependencies installed successfully!"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "[2/4] Creating .env file..."
  cp .env.example .env
  echo ".env file created from .env.example"
  echo ""
  echo "========================================"
  echo "  ACTION REQUIRED"
  echo "========================================"
  echo "Please update your .env file with your Neon DB connection string:"
  echo ""
  echo "  DATABASE_URL=\"postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require\""
  echo ""
  echo "You can get this from: https://console.neon.tech"
  echo ""
  read -p "Press Enter after you've updated the .env file..."
else
  echo "[2/4] .env file already exists, skipping..."
fi
echo ""

# Generate Prisma client
echo "[3/4] Generating Prisma client..."
npm run db:generate
if [ $? -ne 0 ]; then
  echo "Error: Failed to generate Prisma client"
  exit 1
fi
echo "Prisma client generated successfully!"
echo ""

# Push database schema
echo "[4/4] Pushing database schema..."
npm run db:push
if [ $? -ne 0 ]; then
  echo "Error: Failed to push database schema"
  echo "Make sure your DATABASE_URL in .env is correct"
  exit 1
fi
echo "Database schema pushed successfully!"
echo ""

echo "================================"
echo "  Setup Complete!"
echo "================================"
echo ""
echo "You can now start the server with:"
echo "  npm run dev"
echo ""
