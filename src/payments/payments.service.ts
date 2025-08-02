import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/user.entity';

type PaymentStatus = 'pending' | 'success' | 'failed';
type PaymentMethod = 'card' | 'upi' | 'bank_transfer';

interface PaymentFilterOptions {
  status?: PaymentStatus;
  method?: PaymentMethod;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getPayments(user: { id: number }, filters?: PaymentFilterOptions) {
    const query = this.paymentRepo
      .createQueryBuilder('payment')
      .where('payment.userId = :userId', { userId: user.id })
      .orderBy('payment.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters?.method) {
      query.andWhere('payment.method = :method', { method: filters.method });
    }

    return await query.getMany();
  }

  async getPayment(data: { id: number }) {
    const payment = await this.paymentRepo.findOneBy({ id: data.id });
    if (!payment) throw new BadRequestException('Payment not found');
    return payment;
  }

  async createPayment(
    data: {
      amount: number;
      receiver: string;
      method: PaymentMethod;
    },
    user: { id: number },
  ) {
    const statuses: PaymentStatus[] = [
      'success',
      'success',
      'failed',
      'pending',
    ];
    const userData = await this.userRepo.findOneBy({ id: user.id });

    if (!userData) throw new BadRequestException('User not found');

    const payment = this.paymentRepo.create({
      amount: data.amount,
      receiver: data.receiver,
      method: data.method,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      user: userData,
    });
    return await this.paymentRepo.save(payment);
  }

  async getPaymentStats(
    user: { id: number },
    filters?: {
      method?: PaymentMethod;
      status?: PaymentStatus;
      timeRange?: '24h' | '7d' | '30d' | 'all';
    },
  ) {
    const query = this.paymentRepo
      .createQueryBuilder('payment')
      .where('payment.userId = :userId', { userId: user.id });

    // Apply method filter if provided
    if (filters?.method) {
      query.andWhere('payment.method = :method', { method: filters.method });
    }

    // Apply status filter if provided
    if (filters?.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    // Apply time range filter
    if (filters?.timeRange && filters.timeRange !== 'all') {
      const date = new Date();

      switch (filters.timeRange) {
        case '24h':
          date.setDate(date.getDate() - 1);
          break;
        case '7d':
          date.setDate(date.getDate() - 7);
          break;
        case '30d':
          date.setDate(date.getDate() - 30);
          break;
      }

      query.andWhere('payment.createdAt >= :date', { date });
    }

    const payments = await query.getMany();

    // Calculate basic counts
    const success = payments.filter((payment) => payment.status === 'success');
    const failed = payments.filter((payment) => payment.status === 'failed');
    const pending = payments.filter((payment) => payment.status === 'pending');

    // Calculate amounts
    const totalRevenue = success.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const averageAmount =
      payments.length > 0 ? totalRevenue / payments.length : 0;

    // Group by method
    const methodStats = payments.reduce(
      (acc, payment) => {
        acc[payment.method] = (acc[payment.method] || 0) + 1;
        return acc;
      },
      {} as Record<PaymentMethod, number>,
    );

    return {
      counts: {
        total: payments.length,
        success: success.length,
        failed: failed.length,
        pending: pending.length,
      },
      amounts: {
        totalRevenue,
        averageAmount: parseFloat(averageAmount.toFixed(2)),
        minAmount:
          payments.length > 0 ? Math.min(...payments.map((p) => p.amount)) : 0,
        maxAmount:
          payments.length > 0 ? Math.max(...payments.map((p) => p.amount)) : 0,
      },
      methods: {
        card: methodStats.card || 0,
        upi: methodStats.upi || 0,
        bank_transfer: methodStats.bank_transfer || 0,
      },
      successRate:
        payments.length > 0
          ? parseFloat(((success.length / payments.length) * 100).toFixed(2))
          : 0,
    };
  }
}
