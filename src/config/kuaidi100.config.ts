export interface Kuaidi100ConfigOption {
  customer: string;
  key: string;
  apis: {
    syncQuery: string;
  };
}

const config: Kuaidi100ConfigOption = {
  customer: '',
  key: '',
  apis: {
    syncQuery: 'http://poll.kuaidi100.com/poll/query.do', // 快递实时查询接口
  },
};

export default config;
