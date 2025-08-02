import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { type Request } from 'express';
import { PaymentsService } from './payments.service';
import { type CreatePaymentDto } from './dto/createpayments.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async getPayments(
    @Req() req: Request,
    @Query('status') status?: 'pending' | 'success' | 'failed',
    @Query('method') method?: 'card' | 'upi' | 'bank_transfer',
  ) {
    const user = req.user as { id: number };
    return this.paymentsService.getPayments(user, { status, method });
  }

  @Post()
  async createPayment(@Req() req: Request, @Body() data: CreatePaymentDto) {
    const user = req.user as { id: number };
    return await this.paymentsService.createPayment(data, user);
  }

  @Get('stats')
  async getPaymentStats(
    @Req() req: Request,
    @Query('method') method?: 'card' | 'upi' | 'bank_transfer',
  ) {
    const user = req.user as { id: number };
    return this.paymentsService.getPaymentStats(user, { method });
  }

  @Get(':id')
  async getPayment(@Req() req: Request) {
    return await this.paymentsService.getPayment({
      id: Number(req.params.id),
    });
  }
}
