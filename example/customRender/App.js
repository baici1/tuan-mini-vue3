import { h } from '../../lib/tuan-mini-vue3.esm.js';

export const App = {
  setup(props) {
    return {
      x: 100,
      y: 100,
    };
  },
  render() {
    return h('rect', { x: this.x, y: this.y });
  },
};
