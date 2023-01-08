/*
 * @Author: baici1 249337001@qq.com
 * @Date: 2023-01-01 11:41:42
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-08 14:08:01
 * @FilePath: \src\shared\index.ts
 * @Description:用于存放一些公共的函数
 * @Github: https://github.com/baici1/
 */

export const extend = Object.assign;
export const isObject = (val) => {
  return val !== null && typeof val == 'object';
};

export const hasChanged = (value, newValue) => {
  return !Object.is(value, newValue);
};

//判断对象是否存在某一个属性
export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
