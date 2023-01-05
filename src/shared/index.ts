/*
 * @Author: baici1 249337001@qq.com
 * @Date: 2023-01-01 11:41:42
 * @LastEditors: baici1 249337001@qq.com
 * @LastEditTime: 2023-01-05 15:55:59
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
