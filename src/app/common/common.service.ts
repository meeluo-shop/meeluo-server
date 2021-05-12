import { Injectable } from '@nestjs/common';
import { FindConditions } from '@jiaxinjiang/nest-orm';
import { CommonTerminalEnum } from './common.enum';

@Injectable()
export class CommonService {
  getTerminal(identity: CommonIdentity) {
    const terminal: {
      target: CommonTerminalEnum;
      id: number;
    } = { target: CommonTerminalEnum.OTHER, id: null };
    if (identity['merchantId']) {
      terminal.target = CommonTerminalEnum.MERCHANT;
      terminal.id = identity['merchantId'];
    }
    if (identity['agentId']) {
      terminal.target = CommonTerminalEnum.AGENT;
      terminal.id = identity['agentId'];
    }
    return terminal;
  }

  getTerminalCondition<T extends { agentId: number; merchantId: number }>(
    target: CommonTerminalEnum,
    id: number,
    extra?: FindConditions<T>,
  ): T {
    const condition: any = { ...(extra || {}) };
    switch (target) {
      case CommonTerminalEnum.AGENT:
        condition.agentId = id;
        break;
      case CommonTerminalEnum.MERCHANT:
        condition.merchantId = id;
        break;
    }
    return condition;
  }
}
