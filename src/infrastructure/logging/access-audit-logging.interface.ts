export type AccessLog = {
  requestId: string;
  ip: string;
  url: string;
  method: string;
  userAgent: string;
  origin: string;
  time: string;
};
export type AuditLog = {
  requestId: string;
  ip: string;
  url: string;
  method: string;
  userAgent: string;
  origin: string;
  body: string;
  time: string;
};

export interface IAccessAuditLogService {
  saveAccessLog(prop: AccessLog): void | Promise<void>;
  saveAuditLog(prop: AuditLog): void | Promise<void>;
}
