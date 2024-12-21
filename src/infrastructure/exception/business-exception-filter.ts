import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { BusinessException, ErrorLogLevel } from './business-exception';

export interface ApiError {
  id: string;
  message: string;
  statusCode: number;
}

@Catch(BusinessException)
export class BusinessExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BusinessExceptionFilter.name);
  catch(exception: BusinessException, host: ArgumentsHost) {
    let body: ApiError;
    let status: HttpStatus;
    if (exception instanceof BusinessException) {
      status = exception.status;
      body = {
        id: exception.id,
        message: exception.apiMessage,
        statusCode: exception.status,
      };

      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      this.logMessage(exception.logLevel, exception.message, exception.id);

      response.status(status).json(body);
    }
  }

  private logMessage(
    logLevel: ErrorLogLevel,
    message: string,
    exceptionId: string,
  ) {
    switch (logLevel) {
      case 'log':
        this.logger.log(`message: ${message}, exceptionId: ${exceptionId}`);
        break;
      case 'warn':
        this.logger.warn(`message: ${message}, exceptionId: ${exceptionId}`);
        break;
      case 'error':
        this.logger.error(`message: ${message}, exceptionId: ${exceptionId}`);
        break;
      case 'verbose':
        this.logger.verbose(`message: ${message}, exceptionId: ${exceptionId}`);
        break;
      default:
        this.logger.verbose(`message: ${message}, exceptionId: ${exceptionId}`);
        break;
    }
  }
}
