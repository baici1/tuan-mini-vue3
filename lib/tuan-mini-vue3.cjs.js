'use strict';

/*
 * @Author: baici1 249337001@qq.com
 * @Date: 2023-01-01 11:41:42
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-08 14:08:01
 * @FilePath: \src\shared\index.ts
 * @Description:用于存放一些公共的函数
 * @Github: https://github.com/baici1/
 */
const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val == 'object';
};
//判断对象是否存在某一个属性
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

const targetMap = new Map();
/**
 * @description: 触发依赖
 * @param {*} target
 * @param {*} key
 * @return {*}
 */
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let deps = depsMap.get(key);
    /**
     * reactive 的响应式需要靠targetMap，ref的响应式则不需要，对象内部存储
     * 他们之间有重复功能的代码，进行抽离并复用
     */
    triggerEffects(deps);
}
function triggerEffects(deps) {
    //执行 key字段(reactive对象和ref对象)所存在得依赖
    for (const effect of deps) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

/**
 * @description: 无需重复执行createGetter(),createSetter()等函数，第一次执行进行缓存
 */
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
/**
 * @description:在reactive，readon 等函数中发现 get部分 存在重复代码，进行重构成createGetter
 * tip 对照reactive，readon 中的 get 代码前后对照，了解重构必要性
 * @param {*} isReadonly 只读的标志
 * @return {*}
 */
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key == "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key == "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        //如果此时 shallow 标志为true，浅层的只读,不需要收集依赖以及深层处理
        if (shallow) {
            return res;
        }
        // 如果res是object，应该是继续执行reactive/readonly
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
/**
 * @description:在reactive，readon 等函数中 set部分 发现存在重复代码，进行重构成createGetter
 * @return {*} set function
 */
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
/**
 * @description: 用于重构reactive等函数Proxy重复结构，简化内部函数
 */
const mutableHandlers = {
    get,
    set,
};
/**
 * @description: 用于重构readonly等函数Proxy重复结构，简化内部函数
 */
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key:${key} set failed because target is readonly`, target);
        return true;
    },
};
/**
 * @description: 用于重构shallowReadonly等函数Proxy重复结构，简化内部函数
 */
const shallowReadonlyHandlers = extend({}, readonlyHandlers, { get: shallowReadonlyGet });

function reactive(raw) {
    return createActionObject(raw, mutableHandlers);
}
/**
 * @description: 只读：是不需要做依赖收集，也不会去触发依赖
 * @param {*} raw
 */
function readonly(raw) {
    return createActionObject(raw, readonlyHandlers);
}
/**
 * @description: shallowReadonly 只把最外层的数据设置为只读模式，深层数据不做要求，非响应式
 * @param {*} raw
 */
function shallowReadonly(raw) {
    return createActionObject(raw, shallowReadonlyHandlers);
}
/**
 * @description: 增加可读性，抽离重复代码
 * @param {any} raw
 * @param {*} baseHandlers
 */
function createActionObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} must be object`);
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}

/**
 * @description: 初始化Props：给实例绑定 Props属性
 * @param {*} instance
 * @param {*} rawProps
 * @return {*}
 */
function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

//以map形式去适应不同的key，以及对应的函数
const publicPropertiesMap = {
    //this.$el
    $el: (i) => i.vnode.el,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        //setupState
        const { setupState, props } = instance;
        // if (key in setupState) {
        //   return setupState[key];
        // }
        //重构
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

/**
 * @description:创建 组件 instance 对象
 * @param {any} vnode
 * @return {*}
 */
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
    };
    return component;
}
/**
 * @description: 初始化组件前期内容
 * @param {*} instance
 * @return {*}
 */
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props);
    //initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props));
        handleSetupResult(instance, setupResult);
    }
}
/**
 * @description: 处理 setup 内容
 * @param {*} instance
 * @param {any} setupResult
 * @return {*}
 */
function handleSetupResult(instance, setupResult) {
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
/**
 * @description: 结束组件设置，instance绑定render
 * @param {any} instance
 * @return {*}
 */
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

/**
 * @description: 开始渲染
 * @param {*} vnode
 * @param {*} container
 * @return {*}
 */
function render(vnode, container) {
    //patch
    patch(vnode, container);
}
/**
 * @description: 根据当前节点类型判断，选择不同类型的处理process函数
 * @param {*} vnode 当前节点
 * @param {*} container 父节点
 */
function patch(vnode, container) {
    //判断vnode 是不是一个elmenet还是一个component，进行对应处理
    console.log(vnode.type);
    /**
     * component -> object
     * elmenet-> string
     */
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        //处理元素
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        //处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
/**
 * @description: 渲染元素节点
 * @param {any} vnode
 * @param {any} container
 * @return {*}
 */
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    //存储元素节点的实例
    vnode.el = el;
    //获取 虚拟节点 的子内容children和配置信息props
    const { props, children, shapeFlag } = vnode;
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        // ==渲染元素-> string 类型======================
        //当前节点添加内容
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        // ==渲染元素-> array 类型======================
        mountChildren(children, el);
    }
    //添加属性
    for (const key in props) {
        const val = props[key];
        // 开发思路：将具体的click操作重构成通用操作
        // if (key == 'onclick') {
        //   //注册事件监听器
        //   el.addEventListener('click', val);
        // }
        /**
         * 制定规则：
         * key：on+Event name
         */
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            let event = key.slice(2).toLowerCase();
            //注册事件监听器
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.append(el);
}
/**
 * @description: 渲染子节点
 * @param {*} vnode
 * @param {*} container
 * @return {*}
 */
function mountChildren(vnode, container) {
    vnode.forEach((v) => {
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
/**
 * @description: 组件初始化整体流程 1. 创建 2.设置 3.开始渲染
 * @param {any} vnode
 * @param {any} container
 * @return {*}
 */
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
/**
 * @description: 准备渲染工作，调用生命周期
 * @param {any} instance
 * @param {any} container
 * @return {*}
 */
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    console.log('%c Line:100 🍩 subTree', 'color:#42b983', subTree);
    //vnode->patch
    //vnode->element-mountElement
    patch(subTree, container);
    initialVNode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    // children type
    if (typeof children == 'string') {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
/**
 * @description: 获取组件类型
 * @param {any} type
 * @return {*}
 */
function getShapeFlag(type) {
    return typeof type == 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function createApp(rootComponet) {
    return {
        /**
         * @description: 基于 rootComponet 生成vnode
         * @param {*} rootContainer 根容器
         */
        mount(rootContainer) {
            //vNode
            const vnode = createVNode(rootComponet);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
