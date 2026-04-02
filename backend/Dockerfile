FROM richarvey/nginx-php-fpm:3.1.6

WORKDIR /var/www/html

COPY . /var/www/html

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache || true

ENV WEBROOT=/var/www/html/public

CMD ["/start.sh"]