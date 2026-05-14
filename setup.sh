#!/bin/sh
# Ejecutar una sola vez despues de clonar el repo
set -e
git config core.hooksPath .githooks
chmod +x .githooks/post-merge .githooks/post-checkout
npm install
echo "Setup completado. Los hooks de git quedan activos."
