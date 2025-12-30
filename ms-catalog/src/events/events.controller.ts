import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { Subjects } from '../messaging/subjects';
import type { GatewayPingedEvent } from '@ecommerce/contracts';


@Controller()
export class EventsController {

  @EventPattern(Subjects.GatewayPinged)
  handleGatewayPinged(data: GatewayPingedEvent) {
    console.log('[ms-catalog] gateway.pinged', data);
  }
}
