/**
 * 巨量引擎素材审核适配层
 *
 * 暂无官方 API 文档时：
 * - 使用 MockOceanEngineAuditAdapter 完成演示闭环
 * - 预留 HttpOceanEngineAuditAdapter，对接巨量开放平台素材审核接口
 *
 * 参考对接点（待补充真实 endpoint）：
 * - 素材上传 / 创意提交
 * - 审核状态查询
 * - Webhook 回调
 */

export type OceanEngineAuditStatus = "pending" | "approved" | "rejected";

export interface OceanEngineSubmitParams {
  materialId: string;
  materialType: "image" | "video";
  materialUrl: string;
  advertiserId?: string;
  platform: string;
  metadata?: Record<string, unknown>;
}

export interface OceanEngineAuditResult {
  externalAuditId: string;
  status: OceanEngineAuditStatus;
  rejectReason?: string;
  raw?: unknown;
}

export interface OceanEngineAuditAdapter {
  submit(params: OceanEngineSubmitParams): Promise<OceanEngineAuditResult>;
  getStatus(externalAuditId: string): Promise<OceanEngineAuditResult>;
}

/** 内存模拟审核队列（演示用） */
const mockAuditStore = new Map<string, OceanEngineAuditResult>();

export class MockOceanEngineAuditAdapter implements OceanEngineAuditAdapter {
  async submit(params: OceanEngineSubmitParams): Promise<OceanEngineAuditResult> {
    const externalAuditId = `oe-mock-${params.materialId}-${Date.now()}`;
    const result: OceanEngineAuditResult = {
      externalAuditId,
      status: "pending",
      raw: { provider: "mock", platform: "ocean_engine" },
    };
    mockAuditStore.set(externalAuditId, result);

    // 模拟 3~8 秒后自动通过（90%）或驳回（10%）
    setTimeout(() => {
      const pass = Math.random() > 0.1;
      mockAuditStore.set(externalAuditId, {
        externalAuditId,
        status: pass ? "approved" : "rejected",
        rejectReason: pass ? undefined : "巨量审核：素材含未授权品牌元素，请修改后重提",
        raw: { provider: "mock", simulated: true },
      });
    }, 4000 + Math.random() * 4000);

    return result;
  }

  async getStatus(externalAuditId: string): Promise<OceanEngineAuditResult> {
    return (
      mockAuditStore.get(externalAuditId) ?? {
        externalAuditId,
        status: "pending",
      }
    );
  }
}

export class HttpOceanEngineAuditAdapter implements OceanEngineAuditAdapter {
  private baseUrl: string;
  private accessToken: string;

  constructor() {
    this.baseUrl = process.env.OCEAN_ENGINE_API_BASE ?? "https://open.oceanengine.com/open_api";
    this.accessToken = process.env.OCEAN_ENGINE_ACCESS_TOKEN ?? "";
  }

  async submit(params: OceanEngineSubmitParams): Promise<OceanEngineAuditResult> {
    if (!this.accessToken) {
      throw new Error("未配置 OCEAN_ENGINE_ACCESS_TOKEN，请使用 Mock 适配器或补充巨量 API 凭证");
    }
    // TODO: 对接巨量素材审核 API（待 API 文档）
    const res = await fetch(`${this.baseUrl}/v1/material/audit/submit/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": this.accessToken,
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`巨量审核提交失败: ${res.status}`);
    const data = await res.json();
    return {
      externalAuditId: String(data.audit_id ?? data.data?.audit_id),
      status: "pending",
      raw: data,
    };
  }

  async getStatus(externalAuditId: string): Promise<OceanEngineAuditResult> {
    if (!this.accessToken) {
      throw new Error("未配置 OCEAN_ENGINE_ACCESS_TOKEN");
    }
    const res = await fetch(`${this.baseUrl}/v1/material/audit/status/?audit_id=${externalAuditId}`, {
      headers: { "Access-Token": this.accessToken },
    });
    if (!res.ok) throw new Error(`巨量审核查询失败: ${res.status}`);
    const data = await res.json();
    const statusMap: Record<string, OceanEngineAuditStatus> = {
      AUDITING: "pending",
      APPROVE: "approved",
      REJECT: "rejected",
    };
    return {
      externalAuditId,
      status: statusMap[data.status] ?? "pending",
      rejectReason: data.reject_reason,
      raw: data,
    };
  }
}

export function getOceanEngineAdapter(): OceanEngineAuditAdapter {
  if (process.env.OCEAN_ENGINE_ACCESS_TOKEN && process.env.OCEAN_ENGINE_USE_HTTP === "true") {
    return new HttpOceanEngineAuditAdapter();
  }
  return new MockOceanEngineAuditAdapter();
}
