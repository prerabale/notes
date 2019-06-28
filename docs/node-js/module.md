# 模块系统

[TOC]

在 `Node.js` 的模块系统里，每一个文件都是单独的一个模块(Module)，通过 `require` 相互连接，只要简单的 `require('ModuleName')` 就可以引入其它模块。

`require`的[模块化规范](../javascript/modular-specification.md)采用的是 `CommonJS`，模块的加载是同步完成的。

在 `require` 的实现中有 4 个重要的变量，`module`、`exports`、`require`、`global`，`module.exports`为当前模块对外输出的接口。

![](../../images/require.png)

## 用法

`require('moduleName')`即可导入模块，`moduleName`可以是以下几种情况：

* `Node.js`的内置模块，例如: `http`、`fs`等
* [npm]([https://www.npmjs.com](https://www.npmjs.com/))上的模块
* 目录
* 文件

## 加载规则

1. 如果已加载过

   已加载过的模块被缓存在 requre.cache 上，已经加载过的模块不会再次加载，可以通过删除 key 来清除缓存。

   存储的 key 会是模块的绝对路径（原生模块除外，npm模块也会被转换为绝对路径），因为部分系统文件是不区分大小写的，因此在不区分大小的系统上 `/path/to/module` 和 `/path/to/Module` 会是同一个模块，但是因为缓存的命中是对比的字符串，是区分大小写的，所以这种情况下模块会被多次加载。

2. 如果是原生提供的模块

   是原生模块则直接返回结果

3. 如果不是文件路径，例如：`require('express')`

   此时`Node.js`会根据[寻径规则](#寻径规则)给出一个目录的列表，然后在这个列表里面逐一进行以下规则的匹配：

   1. 从 列表中取出第一个目录作为查找基准。
   2. 直接从目录中查找该文件，如果存在，则结束查找。如果不存在，则进行下一条查找。
   3. 尝试添加.js、.json、.node 后缀后查找，如果存在文件，则结束查找。如果不存在，则进行下一条。
   4. 尝试将 require 的参数作为一个包来进行查找，读取目录下的 package.json 文件，取得 main 参数指定的文件。
   5. 尝试查找该文件，如果存在，则结束查找。如果不存在，则进行第 3 条查找。
   6. 如果继续失败，则取出列表中的下一个目录作为基准查找，循环第 1 至 5 个步骤。
   7. 如果继续失败，循环第 1 至 6 个步骤，直到列表中的最后一个值。
   8. 如果仍然失败，则抛出异常。

   然后使用[加载器](#加载器)进行加载，返回加载的结果。

4. 如果是文件路径

   * 相对路径：`Node.js`会拼接上父级（调用`require`的文件。除了`Node.js`启动时系统自己通过 `requireMain`调用的`require`之外场景都是有父级的）的路径
   * 绝对路径：直接使用此路径。

   例如：在 /root/workSpace/project/index.js 中调用了 `require('./helper.js')`，路径会被转换成`/root/workSpace/project/helper.js`。

   然后使用[加载器](#加载器)进行加载，返回加载的结果。

### 寻径规则

`Node.js`给出的目录列表是根据以下条件：

- 入口文件的所在目录

  假设我们的入口文件是：`/path/to/project/index.js`，那么这个目录就是 `/path/to/project`，由此 `Node.js`会从此目录逐级向上查找 `node_modules`目录，由此会得到：

  ```js
  [
    '/path/to/prject/node_modules',
    '/path/to/node_modules',
    '/path/node_modules',
    '/node_modules'
  ]
  ```

  

- 用户的`home`目录（`cd ~`会进入的目录）

  在此目录下，`Node.js`会给出两个目录

  ```js
  [
    '/path/to/homeDir/.node_modules',
    '/path/to/homeDir/.node_libraries'
  ]
  ```

- `Node`这个可执行文件的所在目录

  假设可执行文件在 `/path/to/node`，`Node.js`会拼接上`../../lib/node`，结果就是`/lib/node`

最终我们看到的目录列表会是：

```js
[
	'/path/to/prject/node_modules',
  '/path/to/node_modules',
  '/path/node_modules',
  '/node_modules',
  '/path/to/homeDir/.node_modules',
  '/path/to/homeDir/.node_libraries',
	'/lib/node'
]
```

### 加载器

`Node.js`会根据加载文件名的后缀决定使用何种加载方式进行加载。

目前系统自带的加载方式只有 `.js`、`.json`、`.node`三个类型，通过打印 `require.extensions`可以看到。

如果想要自定义加载格式，只需要向 `require.extensions`中注册新的加载器即可。

#### .js

这个是我们最常用的加载器了，在加载一个 `JS` 文件时都是调用的这个方法。

先让我们看看源码中的实现：

```js
// Native extension for .js
Module._extensions['.js'] = function(module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
  module._compile(stripBOM(content), filename);
};
```

这里的`stripBOM`这个函数的作用是清除文件头部的[字节顺序标记]([https://zh.wikipedia.org/wiki/%E4%BD%8D%E5%85%83%E7%B5%84%E9%A0%86%E5%BA%8F%E8%A8%98%E8%99%9F](https://zh.wikipedia.org/wiki/位元組順序記號))

`module._compile`里面主要做的事情就两件

1. 把文件的内容包裹上一层外壳，让后交给 `vm`模块去编译成一个可执行函数

2. 把函数的作用域绑定给 module.exports，以及传入特定的变量进行调用；

   ```js
   function compile(content, filename) {
     // create wrapper function
     var wrapper = '(function (exports, require, module, __filename, __dirname) { '
     	+ content
     	+'\n});';
   
     var compiledWrapper = vm.runInThisContext(wrapper, {
       filename: filename,
       lineOffset: 0,
       displayErrors: true
     });
   
     var dirname = path.dirname(filename);
     var require = makeRequireFunction(this);
     var result = compiledWrapper.call(this.exports, this.exports, require, this, filename, dirname);
     return result;
   };
   ```

   

#### .json

这个是最简单的一个加载器了，让我们来看看源码中的实现：

```js
// Native extension for .json
Module._extensions['.json'] = function(module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
  try {
    module.exports = JSON.parse(stripBOM(content));
  } catch (err) {
    err.message = filename + ': ' + err.message;
    throw err;
  }
};
```

在这个加载器中，只是简单地读取文件之后执行 `JSON.parse` 获取到 json 内容。

#### .node

待更新...

#### 自定义

自定义一个加载器非常便利，如果项目中频繁用到特定类型的文件加载，自定义一个加载器不失为一种选择。比如想要添加一个支持 `xml` 格式文件的加载器等等。

我这里实现一个简易的可以支持带注释的 `json` 加载器作为例子，来讲讲如何添加一个自定义的加载器

```js
const fs = require('fs');

// 这是源码中对于文件的处理，我们直接照搬过来就好了
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

// 这里我是覆盖了原来的 json 加载器，你也可以新命名一个，保留原来的加载器
require.extensions['.json'] = function(module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
    try {
      // 这种实现方式会有副作用，因为实际上是把内容当做 js 处理了，但是只是支持注释的话是满足要求的
      eval(`module.exports = ${stripBOM(content)}`);
    } catch (err) {
        err.message = filename + ': ' + err.message;
        throw err;
    }
}
```



## 为什么是 CommonJs

## 如何实现一个异步的 require

## 热更新

## 参考

* [require() 源码解读](http://www.ruanyifeng.com/blog/2015/05/require.html)