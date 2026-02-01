📦 ecommerce-2026

MS-ORDERS-MANAGMENT

-NPM INSTALL
-NPX PRISMA GENERATE
-NPX PRISMA MIGRATE DEV --name init_orders

-DAR PERMISOS A USUARIO PARA SHADOW DATABASE:

        -docker exec -it mysql-invoices mysql -u root -p
        -GRANT
        CREATE,
        DROP,
        ALTER,
        INDEX,
        REFERENCES
        ON *.*
        TO 'orders_user'@'%';

        FLUSH PRIVILEGES;
        -exit;

-REMOVER ARCHIVOS GIT MS NUEVO Remove-Item -Recurse -Force .git


#SOLUCIONAR PROBLEMAS RSA PUBLIC KEY BASES DE DATOS MARIA DB/SQL

docker exec -it mysql-orders mysql -u root -p

ALTER USER 'orders_user'@'%' 
IDENTIFIED WITH mysql_native_password 
BY 'orders_pass';

FLUSH PRIVILEGES;
