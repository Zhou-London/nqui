# NQUI

开发一套基于新版Tailwind的UI组件库。

## 要求
开发一套原创的，基于Tailwind的UI组件库。以HeroUI Pro组件库的样式为灵感：https://heroui.pro/?utm_source=heroui.com&utm_medium=pro_banner&utm_campaign=pro_default，打造出一套全新的UI组件库。

为特定的需求进行特化，除了泛化的组件外，需要加强数据表格，SQL输入表格，数据预览/图表，金融/量化相关的组件。

主要应用场景为：控制台，数据仓库UI，性能监控页面，个人网站，论坛页，移动端。

风格样式以HeroUI Pro为准，在此基础上我们打造属于我们的，原创的组件库。

联网搜索调查最新的文档，语法和资讯。

## 技术细节
- 架构模式：使用npm分发
- 用Radix或React Aria打底
- 用CSS变量定义颜色Token。Tailwind配置引用变量。
- 开发阶段用pnpm link或workspace
- 所有技术栈使用最新的Release版本。
- 联网查阅最新文档，使用最新写法。
- 在项目完工之前，不需要写**太多的文档**