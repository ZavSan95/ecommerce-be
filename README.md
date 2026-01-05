📦 ecommerce-2026

MS-ORDERS-MANAGMENT

-NPM INSTALL
-NPX PRISMA GENERATE
-NPX PRISMA MIGRATE DEV --name init_orders

-DAR PERMISOS A USUARIO PARA SHADOW DATABASE:

        -docker exec -it mysql-orders mysql -u root -root
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
