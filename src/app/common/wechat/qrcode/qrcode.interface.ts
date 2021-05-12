export enum QRCodeSceneEnum {
  MERCHANT_ID = 'mchid',
  GAME_ID = 'gameid',
  TABLE_ID = 'tableid',
}

export type QRCodeSceneValue = {
  [key in QRCodeSceneEnum]?: string | number;
};
