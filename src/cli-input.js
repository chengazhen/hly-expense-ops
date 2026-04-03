function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith("--")) continue;
    const key = current.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function parseJsonPayload(value, flagName) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`${flagName} must be a JSON object`);
    }
    return parsed;
  } catch (error) {
    throw new Error(`Invalid JSON for ${flagName}: ${error.message}`);
  }
}

function toNumber(value, fallback) {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Expected integer but got: ${value}`);
  }
  return parsed;
}

function buildInput(action, args) {
  const payload = parseJsonPayload(args.payload, "--payload");

  if (action === "detail") {
    return {
      businessCode: args["business-code"] ?? payload.businessCode,
      companyOID: args["company-oid"] ?? payload.companyOID,
      companyCode: args["company-code"] ?? payload.companyCode,
    };
  }

  if (action === "companies") {
    return {
      page: args.page !== undefined ? toNumber(args.page, 0) : payload.page,
      size: args.size !== undefined ? toNumber(args.size, 20) : payload.size,
    };
  }

  if (action === "reports") {
    if (!payload.statusList || payload.statusList.length === 0) {
      return {
        ...payload,
        statusList: [1003],
      };
    }
    return payload;
  }

  if (action === "normalize-detail") {
    return payload;
  }

  return payload;
}

function validateInput(action, input) {
  if (action === "detail" && !input.businessCode) {
    throw new Error("detail requires --business-code or payload.businessCode");
  }

  if (
    [
      "reports",
      "create",
      "audit-pass",
      "audit-reject",
      "invoice-reject",
      "approvals-pass",
      "employee-create",
      "departments",
    ].includes(action) &&
    (!input || Object.keys(input).length === 0)
  ) {
    throw new Error(`${action} requires --payload with a JSON object`);
  }

  if (action === "audit-pass" || action === "audit-reject") {
    if (!input.businessCode) {
      throw new Error(`${action} requires payload.businessCode`);
    }
    if (!input.companyOID && !input.companyCode) {
      throw new Error(`${action} requires payload.companyOID or payload.companyCode`);
    }
  }

  if (action === "invoice-reject") {
    if (!input.businessCode) {
      throw new Error("invoice-reject requires payload.businessCode");
    }
    if (!input.operatorEmployeeId) {
      throw new Error("invoice-reject requires payload.operatorEmployeeId");
    }
    if (!input.operationType) {
      throw new Error("invoice-reject requires payload.operationType");
    }
    if (
      input.operationType !== "APPROVAL_INVOICE_REJECT" &&
      input.operationType !== "AUDIT_INVOICE_REJECT"
    ) {
      throw new Error(
        "invoice-reject payload.operationType must be APPROVAL_INVOICE_REJECT or AUDIT_INVOICE_REJECT",
      );
    }
    if (!Array.isArray(input.expenseCodeSet) || input.expenseCodeSet.length === 0) {
      throw new Error("invoice-reject requires payload.expenseCodeSet");
    }
    if (input.expenseCodeSet.length > 50) {
      throw new Error("invoice-reject payload.expenseCodeSet cannot exceed 50 items");
    }
  }

  if (action === "approvals-pass") {
    if (!input.businessCode) {
      throw new Error("approvals-pass requires payload.businessCode");
    }
    if (!input.entityType) {
      throw new Error("approvals-pass requires payload.entityType");
    }
    if (!input.operator) {
      throw new Error("approvals-pass requires payload.operator");
    }
  }
}

function buildTip(action) {
  const tips = {
    detail: "Pass --business-code BX123 or use --payload '{\"businessCode\":\"BX123\"}'.",
    reports:
      "Use --payload with statusList, lastModifyStartDate, and lastModifyEndDate. Defaults to statusList [1003] if omitted.",
    create: "Use --payload with at least employeeId and formCode.",
    "audit-pass":
      "Use --payload with businessCode, companyOID or companyCode, approvalTxt, and operator. (Expense report only)",
    "audit-reject":
      "Use --payload with businessCode, companyOID or companyCode, approvalTxt, and operator.",
    "invoice-reject":
      "Use --payload with businessCode, expenseCodeSet(max 50), operatorEmployeeId, operationType(APPROVAL_INVOICE_REJECT|AUDIT_INVOICE_REJECT), and optional rejectReason/rejectType(1|2).",
    "approvals-pass":
      "Use --payload with businessCode, entityType, operator, and optional approvalTxt/operationDate. (Generic approvals)",
    companies: "You can omit payload and use --page / --size.",
    "employee-create":
      "Use --payload with custDeptNumber, fullName, employeeID, and email.",
    departments: "Use --payload with startDate, endDate, page, and size.",
    "normalize-detail": "Use --payload with a raw HLY response object.",
  };

  return tips[action] ?? "Check --help for supported actions.";
}

export {
  parseArgs,
  parseJsonPayload,
  toNumber,
  buildInput,
  validateInput,
  buildTip,
};
