import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { TypeOrmExceptionFilter } from 'src/utils';
import type { Response } from 'supertest';
import request from 'supertest';

describe('MedicinesController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let medicineBrandUuid: string;
  let userEmail: string;
  let userPassword: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new TypeOrmExceptionFilter());
    await app.init();

    // Setup: Criar usuário
    userEmail = `test-${Date.now()}@example.com`;
    userPassword = 'Senha@123';

    const createUserResponse = await request(app.getHttpServer()).post('/users').send({
      name: 'Test User',
      email: userEmail,
      password: userPassword,
    });

    expect(createUserResponse.status).toBe(201);

    // Setup: Autenticar usuário
    const signInResponse = await request(app.getHttpServer()).post('/auth/sign-in').send({
      email: userEmail,
      password: userPassword,
    });

    expect(signInResponse.status).toBe(200);
    authToken = signInResponse.body.accessToken;

    // Setup: Criar marca de medicamento
    const createBrandResponse = await request(app.getHttpServer())
      .post('/medicine-brands')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'generico',
      });

    expect(createBrandResponse.status).toBe(201);
    medicineBrandUuid = createBrandResponse.body.uuid;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /medicines', () => {
    it('should create a medicine successfully', async () => {
      const createMedicineDto = {
        name: 'dorflex',
        description: 'semelhante ao original',
        quantity: 1,
        medicineBrandUuid,
      };

      const response = await request(app.getHttpServer())
        .post('/medicines')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createMedicineDto)
        .expect(201);

      expect(response.body).toHaveProperty('uuid');
      expect(response.body.name).toBe('dorflex');
      expect(response.body.description).toBe('semelhante ao original');
      expect(response.body.quantity).toBe(1);
      expect(response.body.medicineBrand).toBeDefined();
    });

    it('should prevent concurrent creation of medicines with same name and brand', async () => {
      const medicineName = `concurrent-test-${Date.now()}`;
      const createMedicineDto = {
        name: medicineName,
        description: 'Test concurrent creation',
        quantity: 1,
        medicineBrandUuid,
      };

      // Criar múltiplas requisições simultâneas
      const concurrentRequests = Array.from({ length: 10 }, () =>
        request(app.getHttpServer())
          .post('/medicines')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createMedicineDto),
      );

      // Executar todas as requisições simultaneamente
      const responses = await Promise.all(concurrentRequests);

      // Verificar que apenas uma requisição foi bem-sucedida (201)
      const successfulRequests = responses.filter((res: Response) => res.status === 201);
      expect(successfulRequests).toHaveLength(1);

      // Verificar que as outras requisições falharam com conflito (409)
      const conflictRequests = responses.filter((res: Response) => res.status === 409);
      expect(conflictRequests).toHaveLength(9);

      // Verificar que todas as requisições com conflito têm a mensagem correta
      conflictRequests.forEach((response: Response) => {
        expect(response.body.message).toBe('Medicine already exists');
      });

      // Verificar que apenas um medicamento foi criado no banco
      const findAllResponse = await request(app.getHttpServer())
        .get('/medicines')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const medicinesWithSameName = findAllResponse.body.filter(
        (medicine: { name: string; medicineBrand: { uuid: string } }) =>
          medicine.name === medicineName && medicine.medicineBrand.uuid === medicineBrandUuid,
      );

      expect(medicinesWithSameName).toHaveLength(1);
    });

    it('should allow creating medicines with same name but different brands', async () => {
      // Criar uma segunda marca
      const createBrand2Response = await request(app.getHttpServer())
        .post('/medicine-brands')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `brand-${Date.now()}`,
        })
        .expect(201);

      const medicineBrand2Uuid = createBrand2Response.body.uuid;
      const medicineName = `same-name-different-brand-${Date.now()}`;

      // Criar medicamento com primeira marca
      const response1 = await request(app.getHttpServer())
        .post('/medicines')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: medicineName,
          description: 'First brand',
          quantity: 1,
          medicineBrandUuid,
        })
        .expect(201);

      // Criar medicamento com segunda marca (mesmo nome, marca diferente)
      const response2 = await request(app.getHttpServer())
        .post('/medicines')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: medicineName,
          description: 'Second brand',
          quantity: 1,
          medicineBrandUuid: medicineBrand2Uuid,
        })
        .expect(201);

      expect(response1.body.name).toBe(medicineName);
      expect(response2.body.name).toBe(medicineName);
      expect(response1.body.medicineBrand.uuid).toBe(medicineBrandUuid);
      expect(response2.body.medicineBrand.uuid).toBe(medicineBrand2Uuid);
    });
  });
});
