📦 ecommerce-2026

Arquitectura de ecommerce moderna, basada en microservicios, API First y event-driven, desarrollada con NestJS, Docker y NATS.

El frontend (Next.js) se incorporará en una etapa posterior.
Este repositorio prioriza el diseño del backend y los contratos desde el inicio.

🎯 Objetivos del proyecto

Construir un ecommerce escalable y desacoplado

Definir APIs y eventos antes del frontend

Utilizar comunicación:

síncrona (HTTP)

asíncrona (eventos vía NATS)

Facilitar evolución futura:

productos con variantes

órdenes

pagos

envíos

facturación

🧱 Arquitectura general

Client (future Next.js)
        ↓ HTTP
API Gateway (NestJS)
        ↓ HTTP
Microservices (NestJS)
        ↓ Events
        NATS

Principios:

Gateway como única entrada pública

Microservicios no expuestos al exterior

Eventos para desacoplar lógica

Contratos compartidos y versionables


⚙️ Stack tecnológico

Node.js 20+

NestJS 11

Docker / Docker Compose

NATS (event bus)

Swagger / OpenAPI

TypeScript

Git (monorepo)
