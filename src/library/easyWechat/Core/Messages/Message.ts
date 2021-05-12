'use strict';

import { Merge } from '../../Core/Merge';
import * as Xml2js from 'xml2js';
import HasAttributesMixin from '../Mixins/HasAttributesMixin';
import { humpToSnake } from '../Utils';

export class Message extends HasAttributesMixin {
  static TEXT = 2;
  static IMAGE = 4;
  static VOICE = 8;
  static VIDEO = 16;
  static SHORT_VIDEO = 32;
  static LOCATION = 64;
  static LINK = 128;
  static DEVICE_EVENT = 256;
  static DEVICE_TEXT = 512;
  static FILE = 1024;
  static TEXT_CARD = 2048;
  static TRANSFER = 4096;
  static EVENT = 1048576;
  static MINIPROGRAM_PAGE = 2097152;
  static ALL: number =
    Message.TEXT |
    Message.IMAGE |
    Message.VOICE |
    Message.VIDEO |
    Message.SHORT_VIDEO |
    Message.LOCATION |
    Message.LINK |
    Message.DEVICE_EVENT |
    Message.DEVICE_TEXT |
    Message.FILE |
    Message.TEXT_CARD |
    Message.TRANSFER |
    Message.EVENT |
    Message.MINIPROGRAM_PAGE;

  protected type: string;
  protected id: number;
  protected to: string;
  protected from: string;
  protected properties: Array<string> = [];
  protected jsonAliases: object = {};

  constructor(attributes: object = {}) {
    super();
    attributes = humpToSnake(attributes);
    this.setAttributes(attributes);
  }

  getType(): string {
    return this.type;
  }

  setType(type: string): void {
    this.type = type;
  }

  transformToXml(appends: object = {}, returnAsObject = false): any {
    const data = {
      xml: Merge({ MsgType: this.getType() }, this.toXmlArray(), appends),
    };

    if (returnAsObject) {
      return data;
    }
    const XmlBuilder = new Xml2js.Builder({
      cdata: true,
      renderOpts: {
        pretty: false,
        indent: '',
        newline: '',
      },
    });
    return XmlBuilder.buildObject(data);
  }

  toXmlArray(): void {
    throw new Error(
      `Class "${this.constructor.name}" cannot support transform to XML message.`,
    );
  }

  transformForJsonRequestWithoutType(appends: object = {}): object {
    return this.transformForJsonRequest(appends, false);
  }

  transformForJsonRequest(appends: object = {}, withType = true): object {
    if (!withType) {
      return this.propertiesToObject({}, this.jsonAliases);
    }
    const messageType = this.getType();
    const data = Merge(
      {
        msgtype: messageType,
      },
      appends,
    );

    data[messageType] = Merge(
      data[messageType] || {},
      this.propertiesToObject({}, this.jsonAliases),
    );

    return data;
  }

  propertiesToObject(data: object, aliases: object = null): object {
    this.checkRequiredAttributes();

    for (const property in this.attributes) {
      if (this.attributes[property] == null && !this.isRequired(property)) {
        continue;
      }
      const alias = aliases && aliases[property] ? aliases[property] : null;
      data[alias ? alias : property] = this.get(property);
    }

    return data;
  }
}
