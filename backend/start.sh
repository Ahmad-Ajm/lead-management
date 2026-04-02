#!/bin/sh
set -e

php artisan config:clear || true
php artisan cache:clear || true
php artisan route:clear || true
php artisan view:clear || true

php artisan migrate --seed --force || true

apache2-foreground