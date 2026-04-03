# Action Payload Examples

## detail

Simple flags:

```bash
node index.js --action detail --business-code BX20250401001
```

JSON payload:

```json
{
  "businessCode": "BX20250401001",
  "companyOID": "tenant_oid_optional",
  "companyCode": "tenant_code_optional"
}
```

## reports

```json
{
  "statusList": [1003],
  "lastModifyStartDate": "2025-01-01 00:00:00",
  "lastModifyEndDate": "2025-01-31 23:59:59",
  "page": 0,
  "size": 20,
  "withReceipt": true,
  "withInvoice": true
}
```

Status enums (status):
- `1001`: 编辑中/已撤回/已驳回/审核驳回
- `1002`: 审批中
- `1003`: 待审核
- `1004`: 审核通过
- `1005`: 已付款/流程结束
- `1007`: 待付款
- `1008`: 付款中
- `1015`: 取消支付

Receive enums (receiveStatus):
- `0`: 未收单
- `1`: 已收单
- `2`: 已退单
- `3`: 待退单

Send bill enums (sendBillStatus):
- `0`: 未寄单
- `1`: 已寄单
- `2`: 已退单
- `3`: 待退单

## create

```json
{
  "employeeId": "E001",
  "formCode": "FORM01",
  "submitDate": "2025-04-02 10:00:00",
  "description": "Taxi and meals",
  "amount": 123.45
}
```

## audit-pass

```json
{
  "businessCode": "BX20250401001",
  "approvalTxt": "approved",
  "operator": "finance-bot",
  "companyOID": "tenant_oid_required_or_infer",
  "companyCode": "tenant_code_optional"
}
```

## audit-reject

```json
{
  "businessCode": "BX20250401001",
  "approvalTxt": "missing receipt",
  "operator": "finance-bot",
  "companyOID": "tenant_oid_required_or_infer",
  "companyCode": "tenant_code_optional"
}
```

## invoice-reject

```json
{
  "businessCode": "BX20250401001",
  "expenseCodeSet": ["EXP001", "EXP002"],
  "rejectReason": "invoice mismatch",
  "rejectType": "1",
  "operatorEmployeeId": "EMP001",
  "operationType": "APPROVAL_INVOICE_REJECT"
}
```

Notes:
- `expenseCodeSet` max size: 50
- `operationType`: `APPROVAL_INVOICE_REJECT` or `AUDIT_INVOICE_REJECT`
- `rejectType`: `1` replace, `2` remove (only applies to approval flow)

## approvals-pass

```json
{
  "businessCode": "BX20250401001",
  "entityType": 1002,
  "operator": "RH9999",
  "approver": "RH9999",
  "approvalTxt": "OK",
  "operationDate": "2026-04-03 10:00:00",
  "ignoreHistory": false
}
```

Notes:
- `entityType` is required by the approvals API and depends on the business object type.

## approvals-reject

```json
{
  "businessCode": "BX20250401001",
  "entityType": 1002,
  "operator": "RH9999",
  "approver": "RH9999",
  "approvalTxt": "Reject reason",
  "rejectType": 1,
  "operationDate": "2026-04-03 10:00:00",
  "ignoreHistory": false
}
```

Notes:
- `entityType` is required by the approvals API and depends on the business object type.
- `rejectType`: `1` reject to draft, `2` reject to applicant.

## companies

Simple flags:

```bash
node index.js --action companies --page 0 --size 20
```

JSON payload:

```json
{
  "page": 0,
  "size": 20
}
```

## employee-create

```json
{
  "custDeptNumber": "D001",
  "fullName": "Alice Zhang",
  "employeeID": "EMP001",
  "email": "alice@example.com",
  "mobile": "13800000000"
}
```

## departments

```json
{
  "startDate": "2025-01-01 00:00:00",
  "endDate": "2025-01-31 23:59:59",
  "page": 0,
  "size": 50
}
```
