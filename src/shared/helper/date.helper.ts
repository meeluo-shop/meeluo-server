import { Injectable } from '@nestjs/common';

@Injectable()
export class DateHelperProvider {
  /**
   * 获取当天剩余的时间（秒/毫秒）
   * @param unit
   */
  static getTodaySurplus(unit: 'ms' | 's' = 's') {
    const currentTime = new Date().getTime();
    const todayEndTime = new Date(
      new Date(new Date().getTime()).setHours(23, 59, 59, 999),
    ).getTime();
    const surplus = todayEndTime - currentTime;
    switch (unit) {
      case 'ms':
        return surplus;
      case 's':
        return Math.floor(surplus / 1000);
      default:
        return surplus;
    }
  }
}
