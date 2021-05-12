import { Injectable } from '@nestjs/common';
import { multiply, divide, add, subtract, bignumber } from 'mathjs';

@Injectable()
export class MathHelperProvider {
  static multiply(x: number, y: number) {
    return Number(multiply(bignumber(x), bignumber(y)).valueOf());
  }

  static divide(x: number, y: number) {
    return Number(divide(bignumber(x), bignumber(y)).valueOf());
  }

  static add(x: number, y: number) {
    return Number(add(bignumber(x), bignumber(y)).valueOf());
  }

  static subtract(x: number, y: number) {
    return Number(subtract(bignumber(x), bignumber(y)).valueOf());
  }
}
