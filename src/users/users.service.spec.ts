import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { beforeEach, describe, expect, it } from 'vitest';
import { PrismaService } from 'src/prisma.service';
import { getClient } from '@pkgverse/prismock';

let mockedClient = await getClient({
  prismaClient: PrismaService,
  schemaPath: 'prisma/schema.prisma',
});

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockedClient },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    await mockedClient.reset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return one user', async () => {
      await mockedClient.user.create({
        data: {
          email: 'user1',
        },
      });
      await mockedClient.user.create({
        data: {
          email: 'user12',
          banned: true
        },
      });
      const users = await service.findAll();
      expect(users).toEqual([
        {
          id: 1,
          email: 'user1',
          banned: false,
        },
      ]);
      expect(users).toHaveLength(1);
    });
    it('should return an empty list', async () => {
      const users = await service.findAll();
      expect(users).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update the user if not banned', async () => {
      await mockedClient.user.create({
        data: {
          email: 'user2',
          banned: false,
        },
      });
      const success = await service.update(1, { email: 'updated@example.com' });
      expect(success).toBeTruthy();
      expect(await mockedClient.user.findUnique({ where: { id: 1 } })).toEqual({
        id: 1,
        email: 'updated@example.com',
        banned: false,
      });
    });

    it('should update the user if not banned', async () => {
      await mockedClient.user.create({
        data: {
          email: 'user2',
          banned: true,
        },
      });
      const success = await service.update(1, { email: 'updated@example.com' });
      expect(success).toBeFalsy();
      expect(await mockedClient.user.findUnique({ where: { id: 1 } })).toEqual({
        id: 1,
        email: 'user2',
        banned: true,
      });
    });
  });

  
});
