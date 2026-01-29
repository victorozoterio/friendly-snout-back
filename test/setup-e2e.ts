import { randomUUID } from 'node:crypto';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { buildOptions } from '../src/config';
import { Environment } from '../src/utils';

process.env.NODE_ENV = Environment.PRD;

let schemaId: string;
let dataSource: DataSource;

beforeAll(async () => {
  schemaId = randomUUID();
  process.env.DB_SCHEMA = schemaId;

  // conexão básica (sem schema definido ainda)
  const admin = new DataSource(buildOptions());
  await admin.initialize();

  // cria schema para o teste
  await admin.query(`CREATE SCHEMA IF NOT EXISTS "${schemaId}"`);
  await admin.destroy();

  // agora buildOptions() já usa DB_SCHEMA
  dataSource = new DataSource(buildOptions());
  await dataSource.initialize();
  await dataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  await dataSource.runMigrations();
  await dataSource.destroy();
});

afterAll(async () => {
  const admin = new DataSource(buildOptions());
  await admin.initialize();
  await admin.query(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);

  await admin.destroy();
  delete process.env.DB_SCHEMA;
});
