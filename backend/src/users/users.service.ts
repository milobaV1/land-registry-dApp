import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ){}

    async create(createUserDto: CreateUserDto){
        const exisitingUser = await this.findOne('wallet_address', createUserDto.wallet_address);
        if(exisitingUser) throw new BadRequestException(`User already exists`);
        const newUser = this.userRepository.create(createUserDto);
        const savedUser = await this.userRepository.save(newUser)
        return savedUser
    }

    async findOne(searchParam: 'wallet_address' | 'id', searchValue: string){
        const user = await this.userRepository.findOne({
            where: { [searchParam]: searchValue }
        });
        return user
    }

    async isUserVerified(searchParam: 'wallet_address', searchValue: string){
        //console.log('Service called with:', searchParam, searchValue);
         const user = await this.userRepository.findOne({
            where: { [searchParam]: searchValue }
        });
        
        return user?.kycstatus
    }
}
