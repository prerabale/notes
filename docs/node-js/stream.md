# Stream

[TOC]

## 简介

流(`Stream` )是一种抽象接口的实现，通过化整为零的方式，分批次对数据进行处理，是处理大量数据时的一种利器。在 Node.js 中 `http`中的 `req`、`res` 和 `process.stdout` 都是基于流实现的，但流的概念并非是 `Node.js` 首创，在其它的语言中也有这个概念。

`Node.js` 中的流分为可读、可写，或者可读且可写的，它们都是基于 [`EventEmitter`](https://nodejs.org/dist/latest-v12.x/docs/api/events.html#events_class_eventemitter) 模块实现的，`Node.js` 提供了多种流的基础 API，开发者基于这些 API 可以快速的构建自己需要的流。

流主要就是为了解决大量数据需要处理的问题，在 Node.js 中 `http`中的 `req`、`res` 和 `process.stdout` 都是基于流实现的。

流主要就是为了解决大量数据需要处理的问题，在 Node.js 中的 `http` 和 `process.stdout` 都是基于流实现的。

## stream.Readable

示例：[fs.createWriteStream()](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_createwritestream_path_options)

## stream.Writable

示例：[fs.createReadStream()](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_createreadstream_path_options)

## stream.Duplex

示例：[net.Socket](https://nodejs.org/dist/latest-v12.x/docs/api/net.html#net_class_net_socket)

## stream.Transform

示例：[zlib.createDeflate()](https://nodejs.org/dist/latest-v12.x/docs/api/zlib.html#zlib_zlib_createdeflate_options)

## stream.PassThrough

这是属于 `Transform` 的一种实现