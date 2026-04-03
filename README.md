# HLY Expense Ops

汇联易费用报销的 **Skill 库**。提供稳定的输入/输出契约、默认规则与兜底策略，便于被 Agent 或自动化系统直接调用。

运行环境说明（Bun）：
- Bun 默认自动加载项目根目录的 `.env` 文件
- 若需要手动指定，可用 `bun --env-file <path>`
- 若要禁用 `.env` 自动加载，可用 `bun --no-env-file`

## 功能特性

- **单据查询** — 查询单条审批单详情（支持缓存）
- **单据列表** — 批量查询审批单（支持状态、时间范围筛选）
- **创建单据** — 创建新的费用报销单
- **审批操作** — 审批通过 / 驳回单据
- **公司管理** — 查询租户下的公司列表
- **员工管理** — 创建员工
- **部门查询** — 按时间范围查询部门

## 输入契约（Input Contract）

通用规则：
- `payload` 必须是 JSON 对象。
- `detail` 需要 `businessCode`。
- `reports` 默认自动补 `statusList: [1003]`（待审核）。
- `audit-pass` / `audit-reject` 必须提供 `businessCode`，并且 **二选一**：
`companyOID` 或 `companyCode`。
- `invoice-reject` 必须提供 `businessCode`、`expenseCodeSet`、`operatorEmployeeId`、
`operationType`（可选 `rejectReason`、`rejectType`）。
- `approvals-pass` 必须提供 `businessCode`、`entityType`、`operator`
（可选 `approvalTxt`、`operationDate`）。

### 审批动作对比（避免混淆）

| Action | 中文说明 | 适用范围 | 必填字段 |
|--------|----------|----------|----------|
| `audit-pass` | 报销单审批通过 | 报销单专用 | `businessCode` + `companyOID/companyCode` |
| `approvals-pass` | 通用审批通过 | 通用审批对象 | `businessCode` + `entityType` + `operator` |

### companyOID 自动回填逻辑

当 `audit-pass` / `audit-reject` 未提供 `companyOID`，但提供了 `companyCode` 时：
- 优先读缓存 `data/company-cache.json`（可用 `HLY_COMPANY_CACHE_PATH` 覆盖）。
- 缓存未命中则拉取公司列表并刷新缓存，再次匹配。
- 仍匹配不到将报错。

缓存时效由 `HLY_CACHE_TTL_SECONDS` 控制。

## 输入示例（JSON Payload）

单据详情：
```json
{
  "businessCode": "ER51184982"
}
```

查询单据列表（默认待审核）：
```json
{
  "page": 0,
  "size": 20
}
```

审批通过（companyOID 显式传入）：
```json
{
  "businessCode": "ER51184982",
  "companyOID": "your-company-oid",
  "approvalTxt": "approved",
  "operator": "your_operator_id"
}
```

审批驳回（companyCode 自动回填 companyOID）：
```json
{
  "businessCode": "ER51184982",
  "companyCode": "your-company-code",
  "approvalTxt": "missing receipt",
  "operator": "your_operator_id"
}
```

发票驳回（invoice-reject）：
```json
{
  "businessCode": "ER51184982",
  "expenseCodeSet": ["EXP001", "EXP002"],
  "operatorEmployeeId": "EMP001",
  "operationType": "APPROVAL_INVOICE_REJECT",
  "rejectReason": "invoice mismatch",
  "rejectType": "1"
}
```

审批通过（approvals-pass）：
```json
{
  "businessCode": "ER51184982",
  "entityType": 1002,
  "operator": "RH9999",
  "approvalTxt": "OK",
  "operationDate": "2026-04-03 10:00:00"
}
```

## Action 列表

| Action | 说明 |
|--------|------|
| `detail` | 查询单条审批单详情 |
| `reports` | 批量查询审批单 |
| `create` | 创建审批单 |
| `audit-pass` | 审批通过 |
| `audit-reject` | 审批驳回 |
| `invoice-reject` | 发票驳回 |
| `approvals-pass` | 审批通过（通用） |
| `companies` | 查询公司列表 |
| `employee-create` | 创建员工 |
| `departments` | 查询部门 |

## 状态枚举（用于 reports 过滤）

报销单状态 `status`：
- `1001` 编辑中/已撤回/已驳回/审核驳回
- `1002` 审批中
- `1003` 待审核
- `1004` 审核通过
- `1005` 已付款/流程结束
- `1007` 待付款
- `1008` 付款中
- `1015` 取消支付

收单状态 `receiveStatus`：
- `0` 未收单
- `1` 已收单
- `2` 已退单
- `3` 待退单

寄单状态 `sendBillStatus`：
- `0` 未寄单
- `1` 已寄单
- `2` 已退单
- `3` 待退单

## 输出格式

所有操作返回统一的 JSON 格式：

```json
{
  "action": "detail",
  "ok": true,
  "summary": {
    "businessCode": "ER51184982",
    "status": 1001,
    "applicant": "xxxx",
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

## License

MIT
