# Timer

`Node.js` 中的 `Timer` 分为 `Immediate` 和 `Timeout` 两类。

这两个类都不是通过 `new` 关键词进行实例化的，而是通过特定的方法产生实例，`Immediate` 对应的方法是 `setInterval`；`Timeout` 类提供了两个方法，分别是：setTimeout、setInterval。

另外加上 `process.nextTick`，一共 4 种方法。

> 严格来说 process.nextTick 不算 Timer，Node.js 中关于 Timer 的 API 里并没有包含这部分。但是 process.nextTick 也能够使代码实现异步，故此放在一起说明。

