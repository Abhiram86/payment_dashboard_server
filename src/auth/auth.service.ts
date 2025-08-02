import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(data: LoginDto) {
    try {
      const user = await this.userRepo.findOneBy({ email: data.email });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      const verify = await bcrypt.compare(data.password, user.password);
      if (!verify) {
        throw new BadRequestException('Invalid password');
      }
      const token = this.jwtService.sign({ id: user.id });
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        token,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Login failed');
    }
  }

  async register(data: RegisterDto) {
    try {
      const userExists = await this.userRepo.findOneBy({
        email: data.email,
      });
      if (userExists) {
        throw new BadRequestException('User already exists');
      }
      const hashed = await bcrypt.hash(data.password, 10);
      const user = this.userRepo.create({
        username: data.username,
        email: data.email,
        password: hashed,
      });

      const token = this.jwtService.sign({ id: user.id });

      await this.userRepo.save(user);

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        token,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        const message: string = error.message;
        console.error(message);
        throw new BadRequestException(message);
      } else {
        console.error('Unknown error', error);
        throw new BadRequestException('Registration failed');
      }
    }
  }

  async getUser(id: number) {
    const user = await this.userRepo.findOneBy({ id: id });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
