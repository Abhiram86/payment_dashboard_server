import { IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  receiver: string;

  @IsNotEmpty()
  method: 'card' | 'upi' | 'bank_transfer';
}
