function pick(raw, keys) {
  for (const key of keys) {
    if (raw?.[key] !== undefined && raw?.[key] !== null && raw?.[key] !== "") {
      return raw[key];
    }
  }
  return null;
}

function normalizePayload(raw) {
  if (raw && typeof raw === "object") {
    if (raw.data && typeof raw.data === "object") {
      return raw.data;
    }
    if (raw.body && typeof raw.body === "object") {
      return raw.body;
    }
  }
  return raw;
}

export function normalizeExpenseReportDetail(rawResponse, fallbackBusinessCode = null) {
  const payload = normalizePayload(rawResponse);

  return {
    businessCode: pick(payload, ["businessCode", "expenseReportCode", "code"]) || fallbackBusinessCode,
    status: pick(payload, ["status", "approvalStatus", "workflowStatus"]),
    applicant: pick(payload, ["applicant", "applicantName", "employeeName", "userName"]),
    amount: pick(payload, ["totalAmount", "amount", "paymentAmount"]),
    currency: pick(payload, ["currency", "currencyCode"]),
    submitTime: pick(payload, ["submitTime", "submittedAt", "createdAt", "createTime"]),
    approveTime: pick(payload, ["approveTime", "approvedAt", "approvalTime"]),
  };
}
