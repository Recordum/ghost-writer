import { In } from 'typeorm';
import { request } from 'http';
import { Injectable, Logger } from '@nestjs/common';
import { IAccessAuditLogService } from './access-audit-logging.interface';
import {
  AdminAuditLogRepository,
  HousekeepingRequestRepository,
  HousekeepingSubscriptionRepository,
} from '../persistence/repository';
import { AdminAuditLogEntity } from '../persistence/entity/logging';
import { ClsService } from 'nestjs-cls';
import { UpdateLogRepository } from '../persistence/repository/update-log.repository';
import {
  Resource,
  UpdateLogEntity,
  UpdaterInfo,
  UserInfo,
} from '../persistence/entity/logging/update-log.entity';
import { update } from 'lodash';

@Injectable()
export class UpdateLoggingService {
  constructor(
    private readonly updateLogRepo: UpdateLogRepository,
    private readonly housekeepingSubscriptionRepo: HousekeepingSubscriptionRepository,
    private readonly housekeepingRequestRepo: HousekeepingRequestRepository,
    private readonly cls: ClsService,
  ) {}
  async saveUpdateLog(prop: {
    requestId: string;
    loggingMeta: {
      resource: Resource;
      detail: string;
    };
    body: any;
    updaterInfo: UpdaterInfo;
    status: 'success' | 'fail' | 'pending';
    isCreate: boolean;
  }): Promise<void> {
    const { loggingMeta, body, updaterInfo, status, requestId, isCreate } =
      prop;
    if (!loggingMeta) return;
    if (prop.status === 'success' || prop.status === 'fail') {
      return;
    }

    //생성 일경우 oldValue가 없음으로 newValue만 저장
    if (isCreate) {
      const updateLog = new UpdateLogEntity();
      updateLog.requestId = requestId;
      updateLog.resource = loggingMeta.resource;
      updateLog.detail = loggingMeta.detail;
      updateLog.updaterInfo = updaterInfo;
      updateLog.status = status;
      updateLog.detail = loggingMeta.detail;
      await this.updateLogRepo.save(updateLog);
      return;
    }

    //가사 구독권
    if (
      loggingMeta.resource.firstTier === 'subscription' &&
      loggingMeta.resource.secondTier === 'housekeeping'
    ) {
      const subscriptionId = body.subscriptionId;
      const oldValue = await this.housekeepingSubscriptionRepo.findOne({
        where: {
          id: subscriptionId,
        },
        relations: {
          user: true,
          worker: true,
          locationDetail: true,
        },
      });
      const updateLog = new UpdateLogEntity();
      updateLog.requestId = requestId;
      updateLog.resource = loggingMeta.resource;
      updateLog.detail = loggingMeta.detail;
      updateLog.resourceId = body.subscriptionId;
      updateLog.updaterInfo = updaterInfo;
      updateLog.oldValue = oldValue;
      updateLog.status = status;

      await this.updateLogRepo.save(updateLog);
      return;
    }

    //가사 요청서 (구독 타입)
    if (
      loggingMeta.resource.firstTier === 'request' &&
      loggingMeta.resource.secondTier === 'housekeeping'
    ) {
      const housekeepingRequestId = body.requestId
        ? body.requestId
        : body.requestIds;
      if (typeof housekeepingRequestId === 'string') {
        const oldValue = await this.housekeepingRequestRepo.findOne({
          where: {
            id: housekeepingRequestId,
          },
          relations: {
            user: true,
            worker: true,
            locationDetail: true,
            subscription: true,
          },
        });
        if (!oldValue.subscription) return;
        const updateLog = new UpdateLogEntity();
        updateLog.requestId = requestId;
        updateLog.resource = loggingMeta.resource;
        updateLog.detail = loggingMeta.detail;
        updateLog.resourceId = body.requestId;
        updateLog.updaterInfo = updaterInfo;
        updateLog.oldValue = oldValue;
        updateLog.status = status;
        await this.updateLogRepo.save(updateLog);
        return;
      } else {
        const oldValues = await this.housekeepingRequestRepo.find({
          where: {
            id: In(housekeepingRequestId),
          },
          relations: {
            user: true,
            worker: true,
            locationDetail: true,
            subscription: true,
          },
        });
        for (const oldValue of oldValues) {
          const updateLog = new UpdateLogEntity();
          updateLog.requestId = requestId;
          updateLog.resource = loggingMeta.resource;
          updateLog.detail = loggingMeta.detail;
          updateLog.resourceId = oldValue.id;
          updateLog.updaterInfo = updaterInfo;
          updateLog.oldValue = oldValue;
          updateLog.status = status;
          await this.updateLogRepo.save(updateLog);
        }
      }
      return;
    }
  }

  async saveResult(prop: {
    requestId: string;
    status: 'success' | 'fail';
    loggingMeta: {
      resource: Resource;
      detail: string;
    };
  }): Promise<void> {
    const { requestId, status, loggingMeta } = prop;
    if (!loggingMeta) return;

    if (status === 'success') {
      const log = await this.updateLogRepo.findOne({
        where: {
          requestId: requestId,
        },
      });
      log.status = status;
      // 종류마다 다르게 저장
      // 가사 구독권
      if (
        log.resource.firstTier === 'subscription' &&
        log.resource.secondTier === 'housekeeping'
      ) {
        const newValue = await this.housekeepingSubscriptionRepo.findOne({
          where: {
            id: log.resourceId,
          },
          relations: {
            user: true,
            worker: true,
          },
        });
        log.newValue = newValue;
        await this.updateLogRepo.save(log);
        return;
      }
      // 가사 요청서 (구독 타입)
      if (
        log.resource.firstTier === 'request' &&
        log.resource.secondTier === 'housekeeping'
      ) {
        const newValue = await this.housekeepingRequestRepo.findOne({
          where: {
            id: log.resourceId,
          },
          relations: {
            user: true,
            worker: true,
            locationDetail: true,
            subscription: true,
          },
        });
        log.newValue = newValue;
        await this.updateLogRepo.save(log);
        return;
      }
    } else {
      await this.updateLogRepo.update(
        {
          requestId: requestId,
        },
        {
          status: status,
        },
      );
      return;
    }
  }

  async updateLogWithResourceId(prop: {
    requestId: string;
    status: 'success';
    loggingMeta: {
      resource: Resource;
      detail: string;
    };
    resourceId: string;
  }): Promise<void> {
    const { requestId, status, loggingMeta, resourceId } = prop;
    if (!loggingMeta) return;

    const log = await this.updateLogRepo.findOne({
      where: {
        requestId: requestId,
      },
    });

    if (
      loggingMeta.resource.firstTier === 'request' &&
      loggingMeta.resource.secondTier === 'housekeeping'
    ) {
      log.status = status;
      log.resourceId = resourceId;
      const value = await this.housekeepingRequestRepo.findOne({
        where: {
          id: resourceId,
        },
        relations: {
          user: true,
          worker: true,
          locationDetail: true,
          subscription: true,
        },
      });
      log.newValue = value;
      await this.updateLogRepo.save(log);
      return;
    }
  }
}
