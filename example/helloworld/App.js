export const App = {
  render() {
    return h('div', 'hi,' + msg);
  },
  setup() {
    return {
      msg: 'mini-vue',
    };
  },
};
