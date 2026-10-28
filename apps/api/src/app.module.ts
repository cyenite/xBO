import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';

@Module({
  imports: [DatabaseModule, CoreModule, AuthModule, OrganizationsModule],
})
export class AppModule {}
