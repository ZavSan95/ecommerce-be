import { Controller, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SendNotificationDto } from './dto/notification.dto';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);
  
  constructor(private readonly notificationsService: NotificationsService) {}

@MessagePattern('notifications.send')
async handleSend(@Payload() payload: SendNotificationDto) {

  // 🔍 log claro
  this.logger.log(`Payload recibido: ${JSON.stringify(payload)}`);

  return this.notificationsService.send(payload);
}

}
