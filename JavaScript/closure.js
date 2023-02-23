// Author: LovelyKein

// Mail: lovelyKein@foxmain.com

// Time: 2023-02-20


/* 闭包 */

// 特点
// 1. 会常驻内存，慎用；
// 2. 拥有独立的词法作用域，私有化变量；
// 3. 延伸变量生命周期；

const calculateCount = () => {
  let num = 0

  const changeNum = (value) => {
    num += value
  }

  // 返回给外部使用
  return {
    add: () => {
      changeNum(1)
    },
    reduce: () => {
      changeNum(-1)
    },
    eval: (value) => {
      num = value
    },
    getValue: () => {
      return num
    }
  }
}

const count_A = calculateCount()
const count_B = calculateCount()

count_A.add()
count_B.eval(5)

console.log(count_A.getValue()) // 1
console.log(count_B.getValue()) // 5

// 结论： count_A 和 count_B 内的数据互不影响；
// 拓展：Vue 中的 data 之所以会是 data() { return {} } 这样的函数形式，就是闭包原理，使每个组件都有自己的私有化变量和数据；
