//自定义创建多个vnode节点类型，应用于不同场景
const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
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
    //children slot type
    normalizeChildren(vnode, children);
    return vnode;
}
/**
 * @description: 对 children slot类型进行标记 规则：组件+children object
 * @param {*} vnode
 * @param {*} children
 * @return {*}
 */
function normalizeChildren(vnode, children) {
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            // 暂时主要是为了标识出 slots_children 这个类型来
            // 暂时我们只有 element 类型和 component 类型的组件
            // 所以我们这里除了 element ，那么只要是 component 的话，那么children 肯定就是 slots 了
            if (vnode.shapeFlag & 1 /* ShapeFlags.ELEMENT */) ;
            else {
                // 这里就必然是 component 了,
                vnode.shapeFlag |= 16 /* ShapeFlags.SLOTS_CHILDREN */;
            }
        }
    }
}
/**
 * @description: 获取组件类型
 * @param {any} type
 * @return {*}
 */
function getShapeFlag(type) {
    return typeof type == 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}
/**
 * @description: 创建 text 类型的节点
 * @param {string} text
 * @return {*}
 */
function createTextVNode(str) {
    return createVNode(Text, {}, str);
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props = {}) {
    const slot = slots[name];
    if (slot) {
        //作用域插槽是一个函数，需要执行后得到一个 h 。
        const slotContent = slot(props);
        return createVNode(Fragment, {}, slotContent);
    }
}

/*
 * @Author: baici1 249337001@qq.com
 * @Date: 2023-01-01 11:41:42
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-08 16:43:34
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
/**
 * @description: 首字母大写
 * @param {string} str
 * @return {*}
 */
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
/**
 * @description: add-foo -> addFoo
 * @param {string} str
 * @return {*}
 */
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
/**
 * @description: 构建合理的 event name值
 * @param {string} str
 * @return {*}
 */
const toHandlerKey = (str) => {
    return str ? 'on' + capitalize(str) : '';
};

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

function emit(instance, event, ...args) {
    console.log('%c Line:2 🌰 event', 'color:#7f2b82', event);
    // 根据instance.props 属性，找到event 函数
    const { props } = instance;
    /**
     * 开发思路：
     * 先完成特定行为，流程跑同后，重构成一个通用的行为
     */
    //===特定行为==========================
    // const handler = props['onAdd'];
    // handler && handler();
    //===================================
    //通用行为
    /**
     * 分析:
     * 寻找event规则是on + event 首字母大写
     * 增加规则：将 add-foo 处理成 AddFoo
     * 操作：
     * 1. event 按照规则进行处理
     * 2. 与on 进行结合变成handlerName
     * 3. 适当做一些存在性处理
     */
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
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
    $slots: (i) => i.slots,
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

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOTS_CHILDREN */) {
        normalizeObjectSlots(children, (instance.slots = {}));
    }
}
function normalizeObjectSlots(children, slots) {
    //当涉及到具名插槽时候，需要处理的children格式是object
    for (const key in children) {
        const value = children[key];
        console.log('%c Line:9 🥓 value', 'color:#ea7e5c', value);
        //针对作用域插槽的函数形式
        if (typeof value == 'function') {
            slots[key] = (props) => normalizeSlotValue(value(props));
        }
    }
}
function normalizeSlotValue(value) {
    // 同时支持单个vnode和多个vnode节点，所作的处理
    return Array.isArray(value) ? value : [value];
}

/**
 * @description:创建 组件 instance 对象
 * @param {any} vnode
 * @return {*}
 */
function createComponentInstance(vnode, parent) {
    console.log('%c Line:12 🥤 parent', 'color:#4fff4B', parent);
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        emit: () => { },
    };
    //组件挂载 emit
    /**
     * 由于需要传递组件实例对象，但是用户使用则不需要，所以使用 bind 提前传递组件实例对象参数
     */
    component.emit = emit.bind(null, component);
    return component;
}
/**
 * @description: 初始化组件前期内容
 * @param {*} instance
 * @return {*}
 */
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
        setCurrentInstance(null);
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
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    //存值
    /**
     * 问题：
     * 1.存在哪里？答：存在 instance 的 provides 属性中
     */
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (provides == parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    //取值
    /**
     * 问题：
     * 1.在哪儿取？答：父组件的instance 的provides 的属性中拿到
     */
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else {
            if (typeof defaultValue == 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponet) {
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
    };
}

/**
 * 自定义渲染功能
 * 现状：目前渲染功能是基于dom 进行开始渲染，渲染节点函数是 mountElement。
 * 目标：希望能够自定义渲染功能，你可以在非 DOM 环境中也享受到 Vue 核心运行时的特性。
 * 解决方案设想：
 *    1.抽离关键节点函数，需要做的行为函数
 *    2.保留整体流程
 *    3.用户实现行为函数，就可以达到预期效果
 * 根据此设想情况，可以采用策略模式进行实现
 * 策略模式：它将对象和行为分开，将行为定义为 一个行为接口 和 具体行为的实现。
 * 实现方案：
 *    1.保留整个流程函数，抽离行为函数成为一个对外接口
 *    2.用户实现接口，具体行为函数
 *    3.实现在dom环境下，具体行为函数
 *
 */
function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostProp, insert: hostInsert } = options;
    /**
     * @description: 开始渲染
     * @param {*} vnode
     * @param {*} container
     * @return {*}
     */
    function render(vnode, container) {
        //patch
        patch(vnode, container, null);
    }
    /**
     * @description: 根据当前节点类型判断，选择不同类型的处理process函数
     * @param {*} vnode 当前节点
     * @param {*} container 父节点
     */
    function patch(vnode, container, parentComponent) {
        //console.log(vnode.type);
        const { type, shapeFlag } = vnode;
        /**
         * 增加节点类型
         * 1. Fragment 类型：只渲染子节点children
         * 体现：vue页面能够有多个根节点了等等
         * 2. Text 类型：渲染一个文本节点
         * 默认：
         *  component -> object
         *  elmenet-> string
         *
         */
        switch (vnode.type) {
            case Fragment:
                processFragment(vnode, container, parentComponent);
                break;
            case Text:
                processText(vnode, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    //处理元素
                    processElement(vnode, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    //处理组件
                    processComponent(vnode, container, parentComponent);
                }
                break;
        }
    }
    /**
     * @description: 渲染文本节点流程入口
     * @param {any} vnode
     * @param {any} container
     * @return {*}
     */
    function processText(vnode, container) {
        //获取文本值
        const { children } = vnode;
        const el = document.createTextNode(children);
        vnode.el = el;
        container.append(el);
    }
    function processFragment(vnode, container, parentComponent) {
        //只渲染子节点
        mountChildren(vnode.children, container, parentComponent);
    }
    function processElement(vnode, container, parentComponent) {
        mountElement(vnode, container, parentComponent);
    }
    /**
     * @description: 渲染元素节点
     * @param {any} vnode
     * @param {any} container
     * @return {*}
     */
    function mountElement(vnode, container, parentComponent) {
        //const el = document.createElement(vnode.type);
        const el = hostCreateElement(vnode.type);
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
            mountChildren(children, el, parentComponent);
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
            // const isOn = (key: string) => /^on[A-Z]/.test(key);
            // if (isOn(key)) {
            //   let event = key.slice(2).toLowerCase();
            //   //注册事件监听器
            //   el.addEventListener(event, val);
            // } else {
            //   el.setAttribute(key, val);
            // }
            hostProp(el, key, val);
        }
        //container.append(el);
        hostInsert(el, container);
    }
    /**
     * @description: 渲染子节点
     * @param {*} vnode
     * @param {*} container
     * @return {*}
     */
    function mountChildren(vnode, container, parentComponent) {
        vnode.forEach((v) => {
            patch(v, container, parentComponent);
        });
    }
    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent);
    }
    /**
     * @description: 组件初始化整体流程 1. 创建 2.设置 3.开始渲染
     * @param {any} vnode
     * @param {any} container
     * @return {*}
     */
    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent);
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
        //vnode->patch
        //vnode->element-mountElement
        patch(subTree, container, instance);
        initialVNode.el = subTree.el;
    }
    return { createApp: createAppAPI(render) };
}

/*
 * @LastEditTime: 2023-01-11 21:00:40
 * @Description:实现dom环境下，runtime-core对外接口得具体实现函数
 */
function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, val) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        let event = key.slice(2).toLowerCase();
        //注册事件监听器
        el.addEventListener(event, val);
    }
    else {
        //设置属性
        el.setAttribute(key, val);
    }
}
function insert(el, container) {
    container.append(el);
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, renderSlots };
