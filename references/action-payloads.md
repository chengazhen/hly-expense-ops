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
  "statusList": [1001, 1002],
  "lastModifyStartDate": "2025-01-01 00:00:00",
  "lastModifyEndDate": "2025-01-31 23:59:59",
  "page": 0,
  "size": 20,
  "withReceipt": true,
  "withInvoice": true
}
```

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
