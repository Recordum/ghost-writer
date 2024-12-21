import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import * as basicAuth from 'express-basic-auth';
import { UserModule } from 'src/modules/user/user.module';
import { AddressModule } from 'src/modules/addres/address.module';
import { OrganizingModule } from 'src/modules/organizing/organizing.module';
import { OrganizingWholeModule } from 'src/modules/organizing-whole/organizing-whole.module';
import { AdminModule } from 'src/modules/admin/admin.module';
import { Module } from '@nestjs/common';
import { PopUpAdminController } from 'src/modules/promotion-display/presentation/http/controller/pop-up.admin.controller';
import { PopUpUserController } from 'src/modules/promotion-display/presentation/http/controller/pop-up.user.controller';
import { PopUpStaffController } from 'src/modules/promotion-display/presentation/http/controller/pop-up.staff.controller';
import { PromotionDisplayModule } from 'src/modules/promotion-display/promotion.display.module';
import { PopUpService } from 'src/modules/promotion-display/application/pop-up.service';
import { AuthAdminController } from 'src/modules/auth/presentation/http/controller/auth-admin.controller';
import { AuthAdminService } from 'src/modules/auth/application/auth-admin.service';
import { AuthService } from 'src/modules/auth/application';

@Module({
  controllers: [AuthAdminController, PopUpAdminController],
  providers: [AuthService, AuthAdminService, PopUpService],
})
export class SwaggerAdminModule {}

@Module({
  controllers: [PopUpUserController],
  providers: [PopUpService],
})
export class SwaggerUserModule {}

@Module({
  controllers: [PopUpStaffController],
  providers: [PopUpService],
})
export class SwaggerStaffModule {}

const swaggerAuthMiddleware = basicAuth({
  users: { 'swagger-user': 'swagger-password' },
  challenge: true,
  unauthorizedResponse: 'Unauthorized',
});

const createAndSetupSwaggerDocument = (
  app: INestApplication,
  title: string,
  description: string,
  version: string,
  modules: any[],
  path: string,
) => {
  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        name: 'JWT',
        in: 'headers',
      },
      'Authorization',
    )
    .build();

  const documentOptions: SwaggerDocumentOptions =
    modules.length > 0 ? { include: modules } : {};
  const document = SwaggerModule.createDocument(app, config, documentOptions);

  SwaggerModule.setup(path, app, document, {
    swaggerOptions: {
      // docExpansion: 'none', // 모든 모델이 기본적으로 닫힌 상태로 표시됩니다.
    },
  });
};

export function setSwagger(app: INestApplication): void {
  const description = `
  똑똑 백엔드 서버의 API 문서입니다.<br/>
  <br/><a href="/api-docs/user">유저 앱 관련 API 문서</a>
  <br/><a href="/api-docs/staff">스탭 앱 관련 API 문서</a>
  <br/><a href="/api-docs/admin">관리자 웹 관련 API 문서</a>
  `;
  const config = new DocumentBuilder()
    .setTitle('eum-backend API Docs')
    .setDescription(description)
    .setVersion('0.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        name: 'JWT',
        in: 'headers',
      },
      'Authorization',
    )
    .setExternalDoc('Postman Collection', '/api-docs-json')
    .build();

  app.use(
    ['/api-docs', '/api-docs/*'],
    swaggerAuthMiddleware,
    (_req: never, _res: never, next: () => void) => {
      next();
    },
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    // explorer: true,
    swaggerOptions: {
      filter: true,
    },
  });

  /**
   * 24.08.20 정재아 : Swagger 문서 틀만 대강 잡아놓겠습니다. 분류는 조금씩....
   */
  createAndSetupSwaggerDocument(
    app,
    'User API Docs',
    `유저앱에 종속된 기능 관련 API 문서입니다.<br/>
    <br/><a href="/api-docs">기본 API 문서</a>
    <br/><a href="/api-docs/staff">스탭 앱 관련 API 문서</a>
    <br/><a href="/api-docs/admin">관리자 웹 관련 API 문서</a>`,
    '0.1',
    [SwaggerUserModule, UserModule],
    'api-docs/user',
  );
  createAndSetupSwaggerDocument(
    app,
    'Staff API Docs',
    `스탭앱에 종속된 기능 관련 API 문서입니다.<br/>
    <br/><a href="/api-docs">기본 API 문서</a>
    <br/><a href="/api-docs/user">유저 앱 관련 API 문서</a>
    <br/><a href="/api-docs/admin">관리자 웹 관련 API 문서</a>`,
    '0.1',
    [SwaggerStaffModule],
    'api-docs/staff',
  );
  createAndSetupSwaggerDocument(
    app,
    'Admin API Docs',
    `관리자 웹에 종속된 기능 관련 API 문서입니다.<br/>
    <br/><a href="/api-docs">기본 API 문서</a>
    <br/><a href="/api-docs/user">유저 앱 관련 API 문서</a>
    <br/><a href="/api-docs/staff">스탭 앱 관련 API 문서</a>`,
    '0.1',
    [SwaggerAdminModule, AdminModule],
    'api-docs/admin',
  );
}
