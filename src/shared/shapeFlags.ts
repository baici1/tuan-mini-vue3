/**
 * 在render里面根据状态进行处理的地方有很多
 * 1.element
 *  2. text-children
 *  3. array-children
 * 4.component
 * ...
 *
 * 组件具有不同种状态，那么我们可以将其统一抽离出来，以高效方式（位运算）进行修改和查找
 * 修改采用 | 运算
 * 查找采用 & 运算
 */
export const enum ShapeFlags {
  ELEMENT = 1, //0001
  STATEFUL_COMPONENT = 1 << 1, //0010
  TEXT_CHILDREN = 1 << 2, //0100
  ARRAY_CHILDREN = 1 << 3, //1000
}
