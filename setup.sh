#!/usr/bin/env bash

# Assumes the following are installed:
#  - node v14.17.0
#  - npm 6.14.13

echo "[DEBUG] In setup.sh"

# exit on error
set -e

# Get the directory of the script
script_dir="$(cd "$(dirname "$0")"; pwd)"

echo "[DEBUG] Checking versions..."
echo "npm version: `npm --version`"
echo "node version: `node --version`"

echo "[DEBUG] Installing serve..."
npm install -g serve

echo "[DEBUG] FRONTEND SETUP"
cd "${script_dir}/src" && npm install

