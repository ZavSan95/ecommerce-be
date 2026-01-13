import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from 'src/infrastructure/mailer/mailer.service';
import { SendNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
    
    private readonly logger = new Logger(NotificationsService.name);
    constructor(
        private readonly mailService:MailerService,
    ){}

    async send(payload: SendNotificationDto){

        this.logger.log('➡️ Procesando notificación');

        if (payload.channel !== 'email') {
        throw new Error(`Canal no soportado: ${payload.channel}`);
        }

        if (!payload.to?.email) {
        throw new Error('Email destino no especificado');
        }

        await this.mailService.sendMail({
            to: payload.to.email,
            subject: 'Correo de prueba - ms-notifications',
            html: `
                <h2>Notificación de prueba</h2>
                <p>Hola ${payload.data?.name ?? 'usuario'}</p>
                <p>Este correo fue enviado desde <b>ms-notifications</b></p>
            `,
        });

        return { ok: true };
    }
}
