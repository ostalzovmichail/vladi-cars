import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { logger } from './logger'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest()
    const { method, url } = req
    const start = Date.now()

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse()
          const duration = Date.now() - start
          logger.info({ method, url, statusCode: res.statusCode, duration: `${duration}ms` }, 'request completed')
        },
        error: (error) => {
          const duration = Date.now() - start
          logger.error(
            { method, url, statusCode: error.status || 500, duration: `${duration}ms`, error: error.message },
            'request failed',
          )
        },
      }),
    )
  }
}
