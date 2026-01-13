import { connect, StringCodec } from 'nats';

const nc = await connect({
  servers: 'nats://localhost:4222',
});

const sc = StringCodec();

const payload = {
  channel: 'email',
  to: {
    email: 'TU_MAIL_REAL@DOMINIO.COM',
  },
  name: 'Santiago',
};

nc.publish(
  'notifications.send',
  sc.encode(JSON.stringify(payload)),
);

console.log('📤 Evento notifications.send publicado');

await nc.drain();
