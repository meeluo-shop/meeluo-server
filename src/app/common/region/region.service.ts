import * as lodash from 'lodash';
import * as regionData from 'china-area-data';
import { Injectable } from '@nestjs/common';
import { RegionIsAllEnum, RegionListRespDTO } from './region.dto';
import { RegionNameByCodesResult } from './region.interface';

@Injectable()
export class RegionService {
  /**
   * 获取下级地区列表
   * @param code
   */
  public getRegion(code: string, isAll: RegionIsAllEnum) {
    const subRegions = this.regionsFormat(regionData[code] || {});
    if (!isAll) {
      return subRegions;
    }
    for (const region of subRegions) {
      const { value } = region;
      if (regionData[value]) {
        region.children = this.getRegion(value, isAll);
      }
    }
    return subRegions;
  }

  /**
   * 获取指定编码的城市名称
   * @param code
   */
  public getRegionNameByCodes(
    codes: number[],
    regionList = regionData,
    result: RegionNameByCodesResult = {},
  ) {
    codes = Array.from(new Set(codes));
    for (const key in regionList) {
      if (!codes.length) {
        break;
      }
      for (const index in codes) {
        if (codes[index] === Number(key) && lodash.isString(regionList[key])) {
          codes.splice(Number(index), 1);
          result[key] = regionList[key];
          break;
        }
        if (lodash.isObject(regionList[key])) {
          this.getRegionNameByCodes(codes, regionList[key], result);
        }
      }
    }
    return result;
  }

  private regionsFormat(data: { [code: string]: string }) {
    const regionList: RegionListRespDTO[] = [];
    for (const code in data) {
      regionList.push({
        value: code,
        label: data[code],
      });
    }
    return regionList;
  }
}
