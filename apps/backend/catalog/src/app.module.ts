import { Module } from '@nestjs/common'
import { CatalogModule } from './catalog.module'

@Module({
  imports: [CatalogModule],
})
export class AppModule {}
