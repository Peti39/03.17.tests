import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {

  constructor(private readonly db: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return this.db.user.findMany({
      where:{banned: false}
    });
  }

  async findOne(id: number) {
    const user = await this.db.user.findUnique({
      where:{id}
    })
    if(!user){throw new NotFoundException("User not found")}
    if(user.banned){throw new ForbiddenException("User is banned")}
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      return await this.db.user.update({
      where: { id, banned: false },
      data: updateUserDto,
    });
    } catch (error) {
      return false;
    }
    
  }

  async ban(id: number){
    const user = await this.db.user.findUnique({
      where: {id}
    })
    if(!user){throw new NotFoundException("USer not found")}
    return await this.db.user.update({
      where:{id},
      data:{
        banned:true
      }
    })
  }

  async remove(id: number) {
    const user = await this.db.user.findUnique({
      where:{id}
    })
    if(!user){throw new NotFoundException("User not found")}
    return this.db.user.delete({
      where:{id}
    });
  }
}
