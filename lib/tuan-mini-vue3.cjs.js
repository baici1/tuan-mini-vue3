'use strict';

/*
 * @Author: baici1 249337001@qq.com
 * @Date: 2023-01-01 11:41:42
 * @LastEditors: baici1 249337001@qq.com
 * @LastEditTime: 2023-01-05 15:55:59
 * @FilePath: \src\shared\index.ts
 * @Description:用于存放一些公共的函数
 * @Github: https://github.com/baici1/
 */
const isObject = (val) => {
    return val !== null && typeof val == 'object';
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    //initProps()
    //initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    //patch
    patch(vnode, container);
}
function patch(vnode, container) {
    // TODO
    //判断vnode 是不是一个elmenet还是一个component，进行对应处理
    console.log(vnode.type);
    /**
     * component -> object
     * elmenet-> string
     */
    if (typeof vnode.type == 'string') {
        //处理元素
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        //处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    //获取 虚拟节点 的子内容children和配置信息props
    const { props, children } = vnode;
    if (typeof children == 'string') {
        // ==渲染元素-> string 类型======================
        //当前节点添加内容
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(children, el);
    }
    //添加属性
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    //vnode->patch
    //vnode->element-mountElement
    patch(subTree, container);
}
function mountChildren(vnode, container) {
    vnode.forEach((v) => {
        patch(v, container);
    });
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
    };
    return vnode;
}

function createApp(rootComponet) {
    return {
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
