#!/bin/bash

echo "🚀 Levantando microservicios..."

(cd gateway && npm run start:dev) &
(cd ms-auth && npm run start:dev) &
(cd ms-catalog && npm run start:dev) &
(cd ms-orders && npm run start:dev) &
(cd ms-payments && npm run start:dev) &
(cd ms-notifications && npm run start:dev) &
(cd ms-billing && npm run start:dev) &

wait
