import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Response } from 'express'
import { randomUUID } from 'crypto'
import { logger } from './lib/logger'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()
    const errorId = randomUUID().slice(0, 8)

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message

    if (status >= 500) {
      logger.error(
        { errorId, method: request.method, url: request.url, statusCode: status, error: exception.message, stack: exception.stack },
        'internal server error',
      )
    } else {
      logger.warn(
        { errorId, method: request.method, url: request.url, statusCode: status, message },
        'client error',
      )
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: (exceptionResponse as any).error || undefined,
      errorId,
    })
  }
}
