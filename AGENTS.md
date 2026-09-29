# 项目记录：@cnwhy/base64 (Base64.js)

## 概述
一个纯 JS 的 **Base64 编码 / 解码库**，主打「无损转码」。支持二进制数据与字符串 ↔ Base64 互转，能在浏览器和 Node.js 中运行。发布到 npm，包名为 `@cnwhy/base64`（作者 cnwhy），MIT 许可。

- GitHub: https://github.com/cnwhy/Base64.js
- RFC 参考: https://tools.ietf.org/html/rfc4648

## 目录结构
```
src/            # TypeScript 源码
  main.ts       # 导出固定 API（encode/decode/URL 变体等）
  Base64.ts     # createEncode / createDecode 核心：码表、补位、编解码算法
  utf8.ts       # UTF-8 字符串 <-> 字节数组的无损转换
  poliyfill.ts  # IE6(ES3) 兼容工具（isArray/isUint8Array/ArrayBuffer 判断）
types/          # 编译生成的 .d.ts 类型声明
dist/           # Rollup 构建产物（es / umd / min）
test/           # ava 测试 + benchmark 基准测试
coverage/       # c8/nyc 覆盖率报告
lib/            # （构建中间产物目录，gitignore 中忽略）
```

## 为何「重复造轮子」(README 动机)
1. 需要纯 Base64 库且能在浏览器使用（基于 Node `Buffer` 思想）。
2. 支持字符串：`btoa`/`atob` 只支持 Latin1。
3. **JavaScript 字符串无损转换**——现有库几乎做不到（详见其 wiki）。
4. Base64 本应与字符串无关，但多数库只支持字符串场景。
5. 支持 Tree-shaking（项目一般只用 `encode` 或 `decode`）。
6. 能应付异型（自定义）Base64 方案。

## API
```ts
const { BASE64_TABLE, BASE64_URL_TABLE, PAD } = require('@cnwhy/base64'); // 导出常量

// encode / decode：标准 Base64（+ / / ，补位 =）
encode(input)          -> string            // input: string | ArrayBuffer | Uint8Array | number[] | Buffer
decode(base64str)      -> Uint8Array | number[]

// URL-safe 变体：- _ 替换 + /
encodeURL(...)         decodeURL(...)

// createEncode(strEncode?)   -> (input) => string        // 自定义码表/补位符/字符串编码器
// createDecode(table?, pad?, strDecode?) -> (base64str) => Uint8Array | number[]
```
要点：
- `encode` 接受字符串、ArrayBuffer、Uint8Array、number[]、Node Buffer。
- `decode` 返回字节数组；若用字符串编码器创建，会重写返回值的 `toString()` 便于还原字符串。
- `utf8Encode`/`utf8Decode` 负责字符串 ↔ UTF-8 字节（无损）。

## 核心实现要点
- **Base64.ts**：`createEncode`/`createDecode` 通过「码表 + 补位符」抽象，支持自定义。内置校验：码表长度必须为 64、每项单字符、无重复；补位符不能在码表中出现。编码按每 3 字节→4 字符分组位移运算；解码反向，并拒绝 `len % 4 == 1` 的非法输入。
- **utf8.ts**：手动实现 UTF-8 编/解码（1~4 字节序列），处理代理对（surrogate pair）↔ Unicode > 0xFFFF，含错误码 `\ufffd`。5/6 字节编码已注释掉以减小打包体积。
- **poliyfill.ts**：为兼容 IE6(ES3) 手动 polyfill `Array.isArray`、`instanceof ArrayBuffer/Uint8Array`；无 `ArrayBuffer` 环境时用普通 `Array` 代替 `Uint8Array`（`MyLikeUint8array`）。

## 构建
- 工具链：TypeScript + Rollup。
- `npm run build` → `tsc --emitDeclarationOnly` 生成 types，再 `rollup -c` 产出 4 个产物：
  - `dist/Base64.es.mjs`（ESM）/ `.es.min.mjs`（压缩 ESM）
  - `dist/Base64.umd.js`（UMD）/ `.umd.min.js`（压缩 UMD，对应 unpkg/jsdelivr）
- Babel preset 目标为 `ie 6`。

## 测试 / CI
- 测试框架：ava（支持 ts-node）。`npm test` → `ava test/index.js`；`npm run test-cov` 加覆盖率(c8) + fail-fast。
- 另有 benchmark 目录（base64Encode/Decode、utf8、数组操作对比）。
- CI：
  - `.github/workflows/ci.yml` —— 每次 push / PR 触发，运行 `npm run verify`（lint + build + test）。
  - `.github/workflows/test-cov.yml` —— 运行 `npm run test-cov` 并上传覆盖率到 Coveralls。
- README badge：Build Status 已从 travis-ci 改为 GitHub Actions（`ci.yml`），Coverage Status 改用 `service=github`。

## 版本与状态
- 当前版本 `1.0.0`，最近提交「发布 v1.0.0」。
- 分支：master / master1；远程含多个 dependabot 依赖更新分支。
- 已发布到 npm（npmjs）及 GitHub Packages。
