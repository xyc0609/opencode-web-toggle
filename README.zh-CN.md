# OpenCode Web Connect

这是一个独立的 macOS OpenCode Desktop 插件，在聊天输入框上方加入全局联网搜索开关。它使用官方实验性 `ComposerPill`：红色表示关闭，绿色表示开启。状态跨项目、会话和模型共享，并保存在用户配置目录。

本仓库整理自现有的 **OpenCode Network Toggle 0.2.2**。服务端和 GUI 源码从原项目原样复制；项目形式是**独立插件**，不是 OpenCode 补丁或 fork。

[English](README.md) · [安装与回滚](INSTALL.md) · [验证状态](VERIFICATION.md)

## 功能

| 状态 | 插件行为 |
| --- | --- |
| 关闭（红色） | 隐藏并拒绝已识别的 WebSearch、WebFetch、Firecrawl 和浏览器工具；检查可见 Shell 命令中常见的浏览器启动与外部 URL；保留本地 Shell 和回环服务，仍遵循 OpenCode 原有权限。 |
| 开启（绿色） | 插件不增加限制；能否调用联网工具仍取决于 OpenCode 原有权限及工具是否已配置。 |

插件**不提供**搜索服务，不安装 Firecrawl，也不能单独让不支持工具调用的 Ollama 模型具备联网能力。OpenCode 需要预先配置可用的联网工具，模型也需能调用它。此包不安装或修改 Ollama、AnythingLLM、OpenCode-Mem、BGE-M3、OCU MCP、AGENTS.md 或 Skills。

## 安全边界

红色状态是 OpenCode 工具策略，**不是系统级断网**。Shell 检查只覆盖可见且能识别的命令写法；间接脚本、动态生成的命令、重定向、未知工具、电脑操作点击及其他应用仍可能联网。包含外部 URL 文字的本地命令也可能被误拦。本插件不新增 Shell 审批，不修改 macOS 网络设置。详见[验证记录](VERIFICATION.md)。

## 兼容性

- 基于 macOS OpenCode Desktop **2.4.1** 与 `@opencode/plugin` **2.4.1** 开发。GUI API 仍属实验性接口；其他版本须单独验证。
- 本仓库在 Node.js **26.13.1** 下通过构建和测试。`npm test` 直接导入 TypeScript，因而需要 Node.js **22.18.0 或更新版本**提供默认类型剥离；其他 Node 版本未针对本包验证。[Node.js 文档](https://nodejs.org/api/typescript.html)
- 地球图标位于输入框上方的 `ComposerPill` 行。此版本没有公开的输入框**内部**独立按钮插槽。
- 服务端使用 `session.context`、`tool.execute.before`、`shell.create.before` 钩子；GUI 与服务端共用 `~/.config/opencode-network-toggle/state.json`。
- 本独立副本已在隔离的 OpenCode 2.4.1 服务中加载为有效的服务端及 GUI 插件；尚未在单独的 Desktop 窗口中目视检查其界面。
- 本地 Ollama 模型和 MCP 服务是独立依赖；整理后的包**尚未验证**本地模型的端到端互联网检索。

## 安装

1. 在 macOS 下载或克隆本仓库。在仓库目录执行 `npm ci`、`npm run typecheck`、`npm run build`、`npm test`。
2. 备份 `~/.config/opencode/opencode.jsonc`。
3. 在全局 `plugins` 数组新增**本仓库目录的绝对路径**，保留原有条目。不要与旧版 `OpenCode Network Toggle` 同时加载：两者使用相同的插件 ID 和状态文件。
4. 重新打开一次 OpenCode Desktop 以加载插件。此后点击地球开关可实时切换，无需重启。

示例（将占位路径替换为你的路径）：

```jsonc
{
  "plugins": [
    "/absolute/path/to/opencode-web-connect"
  ]
}
```

卸载和回滚步骤见 [INSTALL.md](INSTALL.md)。仓库不需要收集你的 OpenCode 全局配置、模型凭据或 API Key。

## 使用与截图

点击输入框上方的地球胶囊。首次安装且没有状态文件时默认红色关闭；状态文件只存储 `{ "enabled": true | false }`。

下列图片是用户提供的 OpenCode Desktop 实机截图。整理时保留了原始像素，只移除了 EXIF 和文本元数据。它们展示开关的两种颜色、关闭时的一次网页搜索拒绝，以及开启时调用 `Parallel 网页搜索` 后模型生成的回答。截图不能独立核实搜索服务返回的数据，也不能仅凭图片确认当前加载的插件构建版本。

| 开启 | 关闭 |
| --- | --- |
| ![输入框上方的绿色联网搜索胶囊](docs/screenshots/on.png) | ![输入框上方的红色联网搜索胶囊](docs/screenshots/off.png) |

![红色状态下网页搜索工具显示被禁用](docs/screenshots/off-websearch.png)

![绿色状态下调用 Parallel 网页搜索](docs/screenshots/on-websearch.png)

来源说明见[截图目录](docs/screenshots/README.md)。

## 开发与许可证

`npm test` 执行策略及服务端钩子模拟测试；`npm run build` 生成 `dist/` 中的 GUI bundle。模拟测试不能证明真实 Desktop 已加载插件或联网服务可用。

本插件原有代码采用 MIT 许可证，见 [LICENSE](LICENSE)。项目仅使用 OpenCode SDK，没有复制 OpenCode 应用源码；OpenCode 上游的 [MIT 许可证](https://github.com/anomalyco/opencode/blob/v2.4.1/LICENSE) 仍属于上游。官方参考：[插件结构](https://opencode.ai/docs/build/plugins/)、[GUI 接口](https://opencode.ai/docs/build/plugins/gui/)、[服务端钩子](https://opencode.ai/docs/build/plugins/server/)。
