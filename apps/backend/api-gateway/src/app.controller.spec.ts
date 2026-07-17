import { Test, type TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'

describe('AppController', () => {
  let controller: AppController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile()

    controller = module.get<AppController>(AppController)
  })

  describe('healthCheck', () => {
    it('returns ok status', () => {
      const result = controller.healthCheck()
      expect(result).toEqual({ status: 'ok', service: 'api-gateway' })
    })
  })
})
