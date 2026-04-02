# HLY Expense Ops

汇联易（ HuiLianYi ）费用报销操作的 CLI 封装工具，提供简单易用的命令行接口来操作 HLY 审批单据。

## 功能特性

- **单据查询** — 查询单条审批单详情（支持缓存）
- **单据列表** — 批量查询审批单（支持状态、时间范围筛选）
- **创建单据** — 创建新的费用报销单
- **审批操作** — 审批通过 / 驳回单据
- **公司管理** — 查询租户下的公司列表
- **员工管理** — 创建员工
- **部门查询** — 按时间范围查询部门

## 安装

```bash
# 克隆仓库
git clone https://github.com/azhena/huilianyi-third-info-mcp.git
cd huilianyi-third-info-mcp/hly-expense-ops

# 安装依赖
npm install

# 全局安装（可选）
npm link
```

## 环境配置

使用前需要设置以下环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `HLY_BASE_URL` | HLY API 基础地址 | `https://api.huilianyi.com` |
| `HLY_APP_ID` | 应用 ID | `your_app_id` |
| `HLY_APP_SECRET` | 应用密钥 | `your_app_secret` |

建议创建 `.env` 文件：

```bash
HLY_BASE_URL=https://api.huilianyi.com
HLY_APP_ID=your_app_id
HLY_APP_SECRET=your_app_secret
```

## 使用方法

### 查看帮助

```bash
node index.js --help
```

### 单据详情

```bash
node index.js --action detail --business-code ER51184982
```

### 查询单据列表

```bash
node index.js --action reports --payload '{
  "statusList": [1001, 1002],
  "lastModifyStartDate": "2026-04-01 00:00:00",
  "lastModifyEndDate": "2026-04-02 23:59:59"
}'
```

### 创建单据

```bash
node index.js --action create --payload '{
  "employeeId": "E001",
  "formCode": "FORM01",
  "submitDate": "2026-04-02 10:00:00",
  "description": "Taxi and meals",
  "amount": 123.45
}'
```

### 审批通过

```bash
node index.js --action audit-pass --payload '{
  "businessCode": "ER51184982",
  "companyOID": "your-company-oid",
  "approvalTxt": "approved",
  "operator": "your_operator_id"
}'
```

### 审批驳回

```bash
node index.js --action audit-reject --payload '{
  "businessCode": "ER51184982",
  "companyOID": "your-company-oid",
  "approvalTxt": "missing receipt",
  "operator": "your_operator_id"
}'
```

### 查询公司列表

```bash
node index.js --action companies
```

### 创建员工

```bash
node index.js --action employee-create --payload '{
  "custDeptNumber": "D001",
  "fullName": "Alice Zhang",
  "employeeID": "EMP001",
  "email": "alice@example.com",
  "mobile": "13800000000"
}'
```

### 查询部门

```bash
node index.js --action departments --payload '{
  "startDate": "2026-01-01 00:00:00",
  "endDate": "2026-12-31 23:59:59"
}'
```

## Action 列表

| Action | 说明 |
|--------|------|
| `detail` | 查询单条审批单详情 |
| `reports` | 批量查询审批单 |
| `create` | 创建审批单 |
| `audit-pass` | 审批通过 |
| `audit-reject` | 审批驳回 |
| `companies` | 查询公司列表 |
| `employee-create` | 创建员工 |
| `departments` | 查询部门 |

## 状态码参考

| 状态码 | 说明 |
|--------|------|
| 1001 | 草稿 |
| 1002 | 审批中 |
| 1003 | 已完成 |
| 1004 | 已撤回 |
| 1005 | 已驳回 |

## 输出格式

所有操作返回统一的 JSON 格式：

```json
{
  "action": "detail",
  "ok": true,
  "summary": {
    "businessCode": "ER51184982",
    "status": 1001,
    "applicant": "韩爽",
    "amount": 1200,
    "currency": "CNY"
  },
  "raw": { ... }
}
```

错误时：

```json
{
  "code": 120913,
  "error": "当前报销单状态无法审核",
  "msg": "...",
  "tip": "..."
}
```

## 构建打包

如需生成单文件可执行版本：

```bash
npm run build
```

输出文件：`dist/hly-expense-ops.bundle.cjs`

## 在 WorkBuddy 中使用

将此目录复制到 WorkBuddy 的 skills 目录：

```bash
cp -r hly-expense-ops ~/.workbuddy/skills/
```

## License

MIT
