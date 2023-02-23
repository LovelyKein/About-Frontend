// Author: LovelyKein
// Mail: lovelyKein@foxmain.com
// Time: 2023-02-20

/* Vue 中 Diff 算法中 的 patch 对比方式 */

// 虚拟 DOM 实际上就是一个保存了真实 DOM 节点信息的对象，存放在内存中


/* 创建节点 */ 

const vNode = {
  target: "ul",
  value: '',
  attributes: {
    class: "ul_list",
    style: "background-color: #eeeeee; list-style: none;"
  },
  children: [
    {
      target: 'li',
      value: '',
      attributes: {
        class: 'item'
      },
      children: [
        {
          target: 'p',
          value: 'p-1',
          attributes: {
            class: 'label'
          }
        }
      ]
    },
    {
      target: 'li',
      value: '',
      attributes: {
        class: 'item'
      },
      children: [
        {
          target: 'p',
          value: 'p-2',
          attributes: {
            class: 'label'
          }
        }
      ]
    },
    {
      target: 'li',
      value: '',
      attributes: {
        class: 'item'
      },
      children: [
        {
          target: 'h5',
          value: 'h5-3',
          attributes: {
            class: 'title'
          }
        },
        {
          target: 'p',
          value: 'p-3',
          attributes: {
            class: 'label'
          }
        }
      ]
    }
  ]
};

const createElement = (vnode) => {
  const { target, attributes, children, value } = vnode;
  // target: 要创建的 DOM 节点
  // value: 标签的 innerText
  // attributes: 目标节点上的属性
  // children: 节点里的字节点

  if (!target) return null

  const elementDom = document.createElement(target)
  if (value) {
    elementDom.innerText = value
  }

  if (attributes && JSON.stringify(attributes) !== '{}') {
    for (let key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        elementDom.setAttribute(key, attributes[key])
      }
    }
  }

  if (children && children.length) {
    children.forEach((item) => {
      elementDom.appendChild(createElement(item))
    })
  }
  return elementDom
}

const element = createElement(vNode)
document.body.appendChild(element)
console.log(element)


/* 更新节点 */
