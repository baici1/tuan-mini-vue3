/**
 * @description: 初始化Props：给实例绑定 Props属性
 * @param {*} instance
 * @param {*} rawProps
 * @return {*}
 */
export function initProps(instance, rawProps) {
  instance.props = rawProps || {};
}
