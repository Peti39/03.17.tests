/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { beforeEach, describe, expect, it } from 'vitest';
import { PrismaService } from 'src/prisma.service';
import { getClient } from '@pkgverse/prismock';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockedClient = await getClient({
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

  describe('ban', () =>{
    it('should ban user', async () =>{
      const user = await mockedClient.user.create({
        data: {
          email: 'user1',
        },
      });
      await service.ban(user.id)
      const userBanned = await mockedClient.user.findUnique({
        where:{
          id: user.id
        }
        })
      expect(userBanned).toEqual(
        {
          id: 1,
          email: 'user1',
          banned: true,
        }
      )
    })
    it('should throw error',() =>{
      
      expect(async () => {await service.ban(1)}).rejects.toThrow(NotFoundException)
      
    })
  })

  describe('FindOne', ()=>{
    it('should return the user', async () =>{
      const user = await mockedClient.user.create({
        data:{
          email: 'user1',
        }
      })
      const resp = await service.findOne(user.id)
      expect(resp).toEqual(user)
    })
    it('should throw user not found',  () =>{
      
      expect(async ()=> await service.findOne(2)).rejects.toThrow(NotFoundException)
    })
    it('should throw user is banned', async () =>{
      const user = await mockedClient.user.create({
        data:{
          email: 'user1',
          banned: true
        }
      })
      expect(async ()=> await service.findOne(user.id)).rejects.toThrow(ForbiddenException)
    })
  })

  describe('remove', () =>{
    it('should remove user', async () =>{
      const user = await mockedClient.user.create({
        data:{
          email: 'user1',
        }
      })
      await service.remove(user.id)
      const users = await mockedClient.user.findMany()
      expect(users).toEqual([])
    })
    it('should throw user not found',  () =>{
      
      expect(async ()=> await service.remove(2)).rejects.toThrow(NotFoundException)
    })
  })

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
