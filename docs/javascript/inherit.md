# 继承

[TOC]

## 简介

JS 中是不存在类的概念，JS 中的继承是通过原型链的模拟实现的。

JS 的继承只有一种结构，那就是对象(object)，每个对象都有一个自己的私有属性 `__proto__`，这是一个访问器属性(通过 `getter` 和 ` setter` 进行访问)，指向的是这个对象构造函数的原型对象。原型对象也会有自己的 `__proto__` 属性，指向它的构造函数原型，以此类推，层层向上查找，最终原型的终点会是 `null`，`null`是 `JS` 原型链中的最后一环。

## new 做了什么

1. 创建一个新对象

2. 将构造函数的作用于赋给新对象（因此 `this` 就指向了这个新对象）

3. 执行构造函数

4. 返回新对象


## 继承需要做什么

* 能够正常访问父类、子类的属性、原型方法
* 父类不被修改
* 子类要能够提供正常的类型判断（instanceof、Object.prototype.isPrototypeOf()）

## 实现方式

### 原型链

#### 实现

```js
function Animal() {
  this.colors = ['red', 'blue']
}

Animal.prototype.eat = function() {
  console.log('eat')
}
Animal.prototype.run = function() {
  console.log('run')
}

function Person(age) {
  this.age = age
}

Person.prototype = new Animal()

Person.prototype.constructor = Person;

Person.prototype.speak = function() {
  console.log('speak')
}

const person = new Person(16);

person.eat() // eat
person.run() // run
person.speak() // speak
console.log(person.colors.toString()) // red,blue
console.log(person.age) // 16
```

 `Person` 创建的时候会自动添加上 `prototype` 属性（不可枚举），且将 `prototype.constructor` 设置为 `Person` ，在将 `Person` 的原型指向 `Animal` 实例的时候会丢失，我们需要手动将 `constructor` 改回来。

#### 优势

* 能够访问父类的变量以及原型链的方法

* 原型链的判断上是合理的

  > person.\_\_proto\_\_ === Person.prototype  
  > person.\_\_proto\_\_.\_\_proto\_\_ === Animal.prototype

#### 问题

1. `Person` 的原型指向的是 `Animal` 的实例，实例上的私有变量是共享的

   `Person` 的原型指向的是 `Animal` 的实例，故此所有的 `Person` 都将会使用同一个实例作为原型，虽然这样做能够获取到 `Animal` 的方法和变量，但是 `Animal` 的私有变量本应该是每一个 `Person` 实例单独实例化一份的却变成了公用。

   例如：

   ```js
   const person1 = new Person(16)
   const person2 = new Person(17)
   
   person1.colors.push('yellow')
   
   person1.colors.toString(); // red,blue,yellow
   person2.colors.toString(); // red,blue,yellow
   ```

2. `Person`的原型指向的是`Aninal`的实例，在 `Person` 的原型定义时就需要初始化一个 `Animal` 的实例，这种情况下，`Animal` 实例的初始化变量是不能够动态传递的。

### 借用构造函数

#### 实现

```js
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log('eat')
}

function Person(age, name) {
  Animal.call(this, name);
  this.age = age;
}

const person = new Person(16, 'Jack')
console.log(person.name) // Jack
console.log(person.age) // 16
person.eat() // TypeError: person.eat is not a function
```

#### 优势

* 子类在创建父类的时候，能够创建单独的父类副本，变量不会共享
* 子类在创建父类的时候，能够动态传递父类的初始化参数

#### 问题

* 因为调用父类只是通过函数方式调用，所以父类原型链上的方法对子类来说是不可见的
* 限制了父类定义时，只能够将属性的定义写在构造函数内部，否则子类将无法继承

### 组合继承

#### 实现

```js
function Animal(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

Animal.prototype.eat = function(){
  console.log('eat')
}

function Person(name, age) {
  Animal.call(this, name)
  this.age = age
}

Person.prototype = new Animal()
Person.prototype.constructor = Person

const person1 = new Person('Jack1', 16)
const person2 = new Person('Jack2', 16)

person1.colors.push('yellow')

person1.eat() // eat
person2.eat() // eat
console.log(person1.age) // 16
console.log(person2.age) // 16
console.log(person1.name) // Jack1
console.log(person2.name) // Jack2
person1.colors.toString() // red,blue,yellow
person2.colors.toString() // red,blue
```

#### 优势

> 结合了原型链和构造函数两种方式的优点，又避免了这两种方式的缺点

- 能够访问父类的变量以及原型链的方法

- 原型链的判断上是合理的

  > person.\_\_proto\_\_ === Person.prototype
  > person.\_\_proto\_\_.\_\_proto\_\_ === Animal.prototype

* 子类在创建父类的时候，能够创建单独的父类副本，变量不会共享
* 子类在创建父类的时候，能够动态传递父类的初始化参数

#### 劣势

调用了两次构造函数，父类在构造函数中对 `this` 的赋值会产生两份。一份在子类的原型上(Person.prototype)，一份在子类实例上(person)，虽然都能够正常访问，但和完美的继承还是有区别。例如：在上面的例子中，如果使用 delete 删除了 person.name，如果是完美的继承，此时访问 person.name 应该是返回 undefined，但在组合继承实现的继承中，person.name 依旧能够返回值，只是返回的是原型链上的属性。

### Object.create

#### 实现

```js
const o = Object.create(Object.prototype, {})

console.log(o.__proto__ === Object.prototype) // true
```

或

```js
function create(superObj, properties) {
  function A() {}
  A.prototype = superObj
  const obj = new A();
  return properties ? Object.defineProperties(obj, properties) : obj
}
```

因为本质上运用的还是原型链方式，所以优缺点也和原型链方式相同

#### 优势

参考[原型链](#原型链)

k

#### 劣势

`Object.create` 存在兼容性问题，必须是 `IE9` 及其以上的版本才可以使用

参考[原型链](#原型链)

### 寄生式组合继承

上面的多种继承方式中，最接近完美的是[组合继承](#组合继承)，仅有的问题是会创建两份变量，一份是属于实例的属性，一份是属于原型的属性。

实际上我们需要的是在实例上的属性（原型上的属性会被所有子类所共享，因而不能是原型上），如果能有办法不在原型上生成属性，那么就是完美的继承方式了。

那么问题的根源在于两次实例化 `Animal` 类时的属性都被保留下来了，已经明确原型上的属性是不需要的情况下，我们可以通过以下方式来去除

```js
function Animal(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

Animal.prototype.eat = function() {
  console.log('eat')
}

function Person(name, age) {
  Animal.call(this, name)
  this.age = age
}

/***** 截止到这里为止，和组合继承没有区别 ******/


/**
 * 这是组合继承的写法，在这里会多调用一次构造函数
 * 问题就在于构造函数中对 this(实例对象) 的赋值会挂载在实例化对象上
 * 而实例化对象又被当做子类的原型，那么这些属性就会出现在子类的原型上，变成子类共享的属性
 */

// Person.prototype = new Animal()
Person.prototype = generateEmptyInstance(Animal.prototype)
Person.prototype.constructor = Person;

Person.prototype.speak = function() {
  console.log('speak')
}

/**
 * 这步是去除原型上属性的核心
 * 在这步中，首先创建一个临时的构造函数，把他的原型修改为父类的原型
 * 这样做的目的是让临时构造函数的原型和父类的一致
 * 然后用临时构造函数去进行实例化，因为临时构造函数内部没有编辑任何内容
 * 所以不会对实例化对象附加任何属性
 * 这样既拿到了父类的原型，又没有对实例化对象造成负面影响
 * 就达到了我们想要去除原型上不必要属性的问题
 */
function generateEmptyInstance(prototype) {
  function A(){}
  A.prototype = prototype
  return new A()
  // 或者
  // return Object.create(prototype)
}
```

接下来让我们验证一下结果

```js
console.log(Animal.prototype.constructor) // [Function: Animal]
console.log(Person.prototype.constructor) // [Function: Person]

const person = new Person('Jack', 16);
const person2 = new Person('Jack2', 18);

// 父类的属性、方法能够正常访问
console.log(person.name) // Jack
person.eat() // eat
// 子类的属性、方法能够正常访问
console.log(person.age) // 16
person.speak() // speak
// 原型链
console.log(person.__proto__ === Person.prototype) // true
console.log(Person.prototype.__proto__ === Animal.prototype) // true
// instanceof
console.log(person instanceof Person) // true
console.log(person instanceof Animal) // true
// isPrototypeOf
console.log(Person.prototype.isPrototypeOf(person)) // true
console.log(Animal.prototype.isPrototypeOf(person)) // true
// 父类生成的属性不共享
person.colors.push('yellow')
console.log(person.colors.toString()) // red,blue,yellow
console.log(person2.colors.toString()) // red,blue
```

## 实现 inherits

```js
function inherits(SubType, SuperType) {
  SubType.prototype = Object.create(SuperType.prototype, {
    constructor: {
      value: SubType,
      writable: true,
      configurable: true
    }
  })
}
```

然后在 `SubType` 的构造函数中必须显式调用父类，即 `SuperType.call(this, ...args)`。

在代码中应用就会是类似下面这样：

```js
function SuperType() {}
function SubType() {
  SuperType.call(this //...args)
  // do something else
}
inherits(SubType, SuperType)

SubType.prototype.something = function() {} // 这部分需要放在 inherits 之后
```

这里只是简单的例子，还有很多地方可以优化，比如 `SubType.prototype` 在 `inherits` 函数内部进行代理，那么 `SubType.prototype` 的定义就无须限制必须放在 `inherits` 之后。

看到这儿有没有觉得很熟悉，其实和 `class` 继承的调用方式如出一辙：

```js
class SuperType { 
}

class SubType extends SuperType {
  constructor() {
    super()
  }
}
```



## 参考

* [JavaScript高级程序设计](https://book.douban.com/subject/10546125/)