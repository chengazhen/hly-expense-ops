import { HttpRequestError } from "./errors.js";

function buildDetailQuery(params) {
  return {
    businessCode: params.businessCode,
    companyOID: params.companyOID,
    companyCode: params.companyCode,
  };
}

function buildCompanyByTenantQuery(params) {
  return {
    page: params.page,
    size: params.size,
  };
}

function buildDepartmentSelectQuery(params) {
  return {
    startDate: params.startDate,
    endDate: params.endDate,
    page: params.page,
    size: params.size,
  };
}

export class HlyExpenseClient {
  constructor({ config, httpClient, authClient }) {
    this.config = config;
    this.httpClient = httpClient;
    this.authClient = authClient;
  }

  async getExpenseReportDetail(params) {
    let token = await this.authClient.getAccessToken();

    try {
      return await this.httpClient.request({
        baseUrl: this.config.hlyBaseUrl,
        path: this.config.hlyExpenseDetailPath,
        method: "GET",
        query: buildDetailQuery(params),
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 401) {
        token = await this.authClient.getAccessToken(true);
        return this.httpClient.request({
          baseUrl: this.config.hlyBaseUrl,
          path: this.config.hlyExpenseDetailPath,
          method: "GET",
          query: buildDetailQuery(params),
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
      throw error;
    }
  }

  async createExpenseReport(payload) {
    let token = await this.authClient.getAccessToken();

    try {
      return await this.httpClient.request({
        baseUrl: this.config.hlyBaseUrl,
        path: this.config.hlyExpenseCreatePath,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload ?? {}),
      });
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 401) {
        token = await this.authClient.getAccessToken(true);
        return this.httpClient.request({
          baseUrl: this.config.hlyBaseUrl,
          path: this.config.hlyExpenseCreatePath,
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload ?? {}),
        });
      }
      throw error;
    }
  }

  async queryExpenseReportsV2(payload) {
    let token = await this.authClient.getAccessToken();

    try {
      return await this.httpClient.request({
        baseUrl: this.config.hlyBaseUrl,
        path: this.config.hlyExpenseReportV2Path,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload ?? {}),
      });
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 401) {
        token = await this.authClient.getAccessToken(true);
        return this.httpClient.request({
          baseUrl: this.config.hlyBaseUrl,
          path: this.config.hlyExpenseReportV2Path,
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload ?? {}),
        });
      }
      throw error;
    }
  }

  async auditPassExpenseReport(payload) {
    let token = await this.authClient.getAccessToken();

    try {
      return await this.httpClient.request({
        baseUrl: this.config.hlyBaseUrl,
        path: this.config.hlyExpenseAuditPassPath,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload ?? {}),
      });
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 401) {
        token = await this.authClient.getAccessToken(true);
        return this.httpClient.request({
          baseUrl: this.config.hlyBaseUrl,
          path: this.config.hlyExpenseAuditPassPath,
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload ?? {}),
        });
      }
      throw error;
    }
  }

  async auditRejectExpenseReport(payload) {
    let token = await this.authClient.getAccessToken();

    try {
      return await this.httpClient.request({
        baseUrl: this.config.hlyBaseUrl,
        path: this.config.hlyExpenseAuditRejectPath,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload ?? {}),
      });
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 401) {
        token = await this.authClient.getAccessToken(true);
        return this.httpClient.request({
          baseUrl: this.config.hlyBaseUrl,
          path: this.config.hlyExpenseAuditRejectPath,
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload ?? {}),
        });
      }
      throw error;
    }
  }

  async rejectExpenseReportInvoice(payload) {
    let token = await this.authClient.getAccessToken();

    try {
      return await this.httpClient.request({
        baseUrl: this.config.hlyBaseUrl,
        path: this.config.hlyExpenseInvoiceRejectPath,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload ?? {}),
      });
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 401) {
        token = await this.authClient.getAccessToken(true);
        return this.httpClient.request({
          baseUrl: this.config.hlyBaseUrl,
          path: this.config.hlyExpenseInvoiceRejectPath,
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload ?? {}),
        });
      }
      throw error;
    }
  }

  async approvalsPass(payload) {
    let token = await this.authClient.getAccessToken();

    try {
      return await this.httpClient.request({
        baseUrl: this.config.hlyBaseUrl,
        path: this.config.hlyApprovalsPassPath,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload ?? {}),
      });
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 401) {
        token = await this.authClient.getAccessToken(true);
        return this.httpClient.request({
          baseUrl: this.config.hlyBaseUrl,
          path: this.config.hlyApprovalsPassPath,
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload ?? {}),
        });
      }
      throw error;
    }
  }

  async createEmployeeV2(payload) {
    let token = await this.authClient.getAccessToken();

    try {
      return await this.httpClient.request({
        baseUrl: this.config.hlyBaseUrl,
        path: this.config.hlyEmployeeCreateV2Path,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload ?? {}),
      });
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 401) {
        token = await this.authClient.getAccessToken(true);
        return this.httpClient.request({
          baseUrl: this.config.hlyBaseUrl,
          path: this.config.hlyEmployeeCreateV2Path,
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload ?? {}),
        });
      }
      throw error;
    }
  }

  async selectDepartment(params) {
    let token = await this.authClient.getAccessToken();

    try {
      return await this.httpClient.request({
        baseUrl: this.config.hlyBaseUrl,
        path: this.config.hlyDepartmentSelectPath,
        method: "GET",
        query: buildDepartmentSelectQuery(params),
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 401) {
        token = await this.authClient.getAccessToken(true);
        return this.httpClient.request({
          baseUrl: this.config.hlyBaseUrl,
          path: this.config.hlyDepartmentSelectPath,
          method: "GET",
          query: buildDepartmentSelectQuery(params),
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
      throw error;
    }
  }

  async queryCompaniesByTenant(params) {
    let token = await this.authClient.getAccessToken();

    try {
      return await this.httpClient.request({
        baseUrl: this.config.hlyBaseUrl,
        path: this.config.hlyCompanyByTenantPath,
        method: "GET",
        query: buildCompanyByTenantQuery(params),
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 401) {
        token = await this.authClient.getAccessToken(true);
        return this.httpClient.request({
          baseUrl: this.config.hlyBaseUrl,
          path: this.config.hlyCompanyByTenantPath,
          method: "GET",
          query: buildCompanyByTenantQuery(params),
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
      throw error;
    }
  }
}
