# 拾页 · AI 草稿本

一款本地优先的 Mac 草稿本。像文本编辑器一样随手开页、记命令和会议记录；需要时把一篇或多篇草稿交给公司 OneAPI，提炼成有原文依据的知识和可导出的 SKILL.md。

## 从仓库运行

需要 macOS 13+ 和 Apple Command Line Tools（`xcode-select --install`）。

```bash
git clone https://github.com/waynemars/draft_pro.git
cd draft_pro
./build.sh "$PWD/dist"
open dist/拾页.app
```

验证构建：

```bash
dist/拾页.app/Contents/MacOS/Shiye --self-test
node Tests/frontend.test.cjs
Tests/editor-layout.sh
```

前端测试需要 Node.js，运行应用本身不需要。GitHub Actions 会在 macOS 上构建、运行核心和前端测试，并提供应用 ZIP 下载。

## 1.1.2 更新

编辑区改用本地打包的 CodeMirror 5.65.20，移除透明输入框叠加高亮层的双重排版。光标按实际字符边界和字高绘制，覆盖中文、emoji、Tab、长命令滚动与自动换行。编辑字号调整为 13px、行高 22px。保留语法高亮、行号、查找替换、缩进和注释；每篇草稿独立保留本次会话的撤销历史与光标位置。编辑器无网络请求，许可见 THIRD_PARTY_NOTICES.md。

## 1.1.1 更新

修复长命令出现横向滚动条后，光标与语法高亮文字错位的问题。输入框作为唯一滚动来源，高亮和行号同步平移，避免不同可视高度造成偏移。自动换行使用实际排版高度显示行号；Markdown 标题高亮保持与输入框相同字宽。新增真实 WebKit 排版回归，覆盖双向滚动、缩窄窗口、中文、emoji、Tab 和插入位置。

## 1.1.0 更新

新增「导入 Sublime」：实时读取所有窗口打开的文本（包含未保存草稿、未保存修改），预览、筛选并勾选后导入为独立副本。自动去重，保留来源，不修改 Sublime 原稿或原文件。可选会话快照读取，界面显示快照时间。

首次实时读取会将附带的 `ShiyeBridge.py` 写入 Sublime 的 `Packages/User`，通过 Sublime 官方 `subl --command` 导出当前文本，随后删除临时快照。扩展只读取打开文本，不执行草稿中的命令，不包含网络操作。不再需要时可删除该扩展文件。

导入后可「准备分批归档」，大量草稿按每批最多 20 篇、约 4.4 万字符分组，超长文本连续分段。逐批预览并确认生成知识 / Skill；所有分段完成后才将长文本原稿标记为已归档。侧栏叠页按钮可在本次会话继续未完成批次。重启后已生成的产物保留，可重新选择未完成原稿准备归档。

## 1.0.3 更新

设置中增加 OneAPI 令牌获取引导，可一键在默认浏览器打开 https://oneapi-comate.baidu-int.com/token。粘贴令牌后可单独点击「保存到本机」，保存至 macOS 系统钥匙串并自动加载模型；下次启动无需再次填写，界面明确显示保存状态。底部「保存设置」同样保存新填入的令牌。

## 1.0.2 更新

修正设置齿轮图标。模型改为从当前 API 的 `GET /models` 接口读取并下拉选择，支持自动加载、手动刷新和错误提示；使用钥匙串中的密钥或本次填写的密钥。获取列表不调用模型、不发送草稿。

## 1.0.1 更新

恢复独立的 macOS 原生标题栏，修复窗口无法拖动的问题，并调整顶部布局。拖住标题栏即可移动窗口。

## 使用

将 `拾页.app` 拖入「应用程序」，也可以直接双击运行。当前打包版本面向 Apple Silicon Mac，运行无需 Node、Python 或额外依赖。应用使用本地签名，尚未进行 Apple 开发者公证。

1. `⌘N` 新建草稿，直接粘贴 curl、pdo2、SQL 或会议记录。未命名草稿也会自动保存在本机。
2. `⌘S` 保存为普通文本文件；`⇧⌘S` 另存为。打开已有文件后，自动保存只保存草稿副本，明确按保存时才写回文件。检测到文件被外部修改时会提示另存或覆盖。
3. `⌘,` 打开设置，点击「前往 OneAPI 获取令牌」，登录后获取个人令牌。复制并粘贴到软件，点击「保存到本机」。软件自动获取模型列表，选择模型和接口格式后保存设置。令牌保存在本机系统钥匙串，重启后自动使用。
4. 点击 **AI 归档** → 检查知识卡片和 Skill 预览 → 选择产物并确认。原稿完整保留在「已归档草稿」，产物带来源链接。
5. 点击左侧草稿标题旁的叠页图标，多选后 **聚合归档**，大量内容会自动准备分批归档，超长草稿会连续分段。
6. `⇧⌘F` 搜索全部草稿、知识和 Skill；`⌘J` 基于匹配记录对话，点击来源回到原文。

首次使用可点击欢迎页的「试试一篇示例草稿」，该示例使用占位服务组与公开示例域名。需要迁移现有记录时，点击侧栏「导入 Sublime」。

## OneAPI

按用户提供的《oneapi接入.pdf》实现，默认基础地址：

```text
https://oneapi-comate.baidu-int.com/v1
```

该服务透传模型原始协议。在设置中选择：

| 接口格式 | 请求路径 | 响应读取 |
| --- | --- | --- |
| OpenAI Chat Completions | `/v1/chat/completions` | `choices[].message.content` |
| OpenAI Responses | `/v1/responses` | `output[].content[type=output_text].text` |
| Anthropic Messages | `/v1/messages` | `content[type=text].text` |

均使用 `Authorization: Bearer <token>`。Anthropic 额外发送 `anthropic-version: 2023-06-01` 和 `max_tokens: 8192`。可选的用户名、代码库会编码到 `comate_custom_header`，`source` 始终留空。不会仿冒官方来源。Responses 显式传递 `store: false`；应用自身不记录 API 请求日志。

模型列表通过当前基础地址下的 `GET /models` 获取，按模型 ID 去重排序。首次填写密钥后自动加载，之后打开设置自动刷新；也可以点击「刷新模型」。列表为空、鉴权失败和服务未提供列表接口时显示原因，并保留上次保存的模型选择。

使用自己有权限的模型。软件没有内置密钥，也不会读取 Codex、Sublime 或其他应用的凭证。文档说明个人 token 的模型调用产生费用，由对应业务承担。

支持自定义 HTTPS 基础地址和本机 Ollama 的 `http://localhost:11434/v1`。当前为完整响应模式，等待模型完成后展示结果，不逐字流式输出。公司真实服务需要个人模型权限及相应内网 / VPN。三种协议通过本机模拟服务测试；OneAPI 模型列表及 Chat Completions 归档已通过真实服务验证。

## 编辑体验

- 多标签和左侧草稿列表，重启恢复打开状态、光标与滚动位置。
- 行号、语法着色、自动缩进、Tab / Shift-Tab、`⌘/` 行注释。
- `⌘F` 查找替换、`⌘P` 快速切换、自动换行开关。
- Markdown 安全预览、标签、置顶、复制、文本 / Skill 导出。
- 定期历史快照，最多 50 份；从历史恢复时额外保存当前版本。
- 废纸篓支持恢复；界面不提供永久删除。

它是一个已实现核心工作流的第一版，不包含 Sublime 的多光标、插件生态、LSP、终端执行或协同编辑。草稿中的命令仅作为文本保存，软件不会执行。

## 数据与隐私

- 数据库：`~/Library/Application Support/Shiye/shiye.sqlite`，SQLite WAL 与事务存储。
- API 密钥：仅保存在 macOS 系统钥匙串，服务标识 `local.shiye.mac.provider`。
- AI 归档发送所选草稿标题与正文；对话发送问题、最多最近 8 条消息和最多 6 篇匹配笔记的正文片段。规则会隐藏常见 Authorization、Cookie、密码、API key、私钥，可能遗漏特殊格式；可在设置切换。
- 原稿保持原样；AI 与本地模板输出使用隐藏常见凭证后的内容。
- 搜索在本机按标题、标签、摘要和正文匹配，支持中文词语匹配与双字片段；第一版不包含向量语义索引。
- 模型不可用时，搜索、编辑、保存照常工作。可以用「本地整理模板」，明确标注为规则生成和待完善，不冒充模型提炼。
- JSON 备份包含全部笔记、原文与废纸篓，不包含模型密钥、设置和历史版本。恢复按笔记 ID 合并，保护较新的本地版本。
- 对话只保留在当前应用会话，不写入数据库。没有账号、遥测或云端同步。

## 源码与构建

Objective-C / AppKit 管理窗口、系统菜单、文件操作、钥匙串、SQLite 和模型请求；系统 WKWebView 渲染本地 HTML/CSS/JavaScript 编辑界面。原生功能无第三方运行时依赖；编辑界面内置 MIT 许可的 CodeMirror（无需安装 Node 或联网加载）。

安装 Apple Command Line Tools 后运行：

```bash
./build.sh
```

默认输出到源码目录的上一层。也可指定输出目录：

```bash
./build.sh /path/to/destination
```

构建目标为当前机器架构与 macOS 13+；交付的应用已在当前 Apple Silicon macOS 上启动并进行界面检查，其他 macOS 版本尚未实机验证。重新构建生成的 app 使用 ad-hoc 签名。需要分发给其他用户时，应使用自己的 Developer ID 签名与公证。

```text
Native/Core.h           数据与模型接口声明
Native/Core.m           SQLite、检索、版本、事务归档、备份与钥匙串
Native/Sublime.m        Sublime 实时 / 会话读取、去重与归档分批
Native/AI.m             OneAPI 三种协议、脱敏、知识与 Skill 提炼
Native/App.m            macOS 窗口、菜单、文件操作与本地消息桥
Native/Tests.m          核心与 API 集成测试
Resources/              离线编辑界面
Tests/                  前端回归与本机模型服务夹具
```

## 测试

```bash
../拾页.app/Contents/MacOS/Shiye --self-test
node Tests/frontend.test.cjs
Tests/editor-layout.sh
```

API 集成测试（两个终端）：

```bash
python3 Tests/mock_api.py 18763
```

```bash
../拾页.app/Contents/MacOS/Shiye --test-api http://127.0.0.1:18763/v1
```

隔离测试数据目录：

```bash
SHIYE_DATA_DIR=/path/to/test-data ../拾页.app/Contents/MacOS/Shiye
```

设置 `SHIYE_DATA_DIR` 时，钥匙串也使用独立的测试条目，不会读取或覆盖正常工作空间的令牌。

令牌持久化测试（仅使用独立的合成令牌，三个命令运行在不同进程）：

```bash
SHIYE_DATA_DIR=/tmp/shiye-credential-test ../拾页.app/Contents/MacOS/Shiye --test-credentials write
SHIYE_DATA_DIR=/tmp/shiye-credential-test ../拾页.app/Contents/MacOS/Shiye --test-credentials read
SHIYE_DATA_DIR=/tmp/shiye-credential-test ../拾页.app/Contents/MacOS/Shiye --test-credentials delete
```
