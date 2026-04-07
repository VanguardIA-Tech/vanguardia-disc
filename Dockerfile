FROM php:8.2-apache

# Extensões necessárias para MariaDB/MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Habilitar mod_rewrite para roteamento da API
RUN a2enmod rewrite

# Copiar todos os arquivos do projeto
COPY . /var/www/html/

# .htaccess para roteamento: /api/* → backend/api.php
RUN echo '<Directory /var/www/html>\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/apache2.conf

# Permissões
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
