import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Land } from './entities/land.entity';
import { SearchLandDto } from './dto/search-land-dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class LandsService {
  constructor(
    @InjectRepository(Land)
    private readonly landRepository: Repository<Land>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}

  async create(createLandDto: CreateLandDto) {
    const user = await this.userRepository.findOne({
      where: { wallet_address: createLandDto.currentOwner }
    })
    if(!user) throw new NotFoundException('User not found');
    console.log("This is the user: ", user)
    const existingLand = await this.findOne('landIdOnChain', createLandDto.landIdOnChain);
    if (existingLand) throw new BadRequestException('Land already exists');
    const newLand = this.landRepository.create(createLandDto);
    newLand.user = user;
    const savedLand = this.landRepository.save(newLand)
    return savedLand
  }

  findAll() {
    return `This action returns all lands`;
  }

  async findOne(searchParam: 'landIdOnChain' | 'id', searchValue: string | number) {
    const land = await this.landRepository.findOne({
      where: { [searchParam]: searchValue },
      relations: ['user'],
    })
    return land;
  }

  async findByAddress(address: string){
    const land = await this.landRepository.find({
      where: { currentOwner: address },
      relations: ['user'],
    });

    return land
  }

//   async search(searchLandDto: SearchLandDto) {
//   const { currentOwner, landIdOnChain, lga, state, search } = searchLandDto;

//   const queryBuilder = this.landRepository.createQueryBuilder('land');

//   if (search) {
//     queryBuilder.andWhere(
//       new Brackets((qb) => {
//         qb.where('LOWER(land.currentOwner) LIKE LOWER(:search)', { search: `%${search}%` })
//           .orWhere('CAST(land.landIdOnChain AS TEXT) LIKE :search', { search: `%${search}%`  })
//           .orWhere('LOWER(land.state) LIKE LOWER(:search)', { search: `%${search}%` })
//           .orWhere('LOWER(land.lga) LIKE LOWER(:search)', { search: `%${search}%` });
//       })
//     );
//   }

//   if (currentOwner) {
//     queryBuilder.andWhere('LOWER(land.address) = LOWER(:address)', { currentOwner });
//   }

//   if (landIdOnChain) {
//     queryBuilder.andWhere('land.landIdOnChain = :landIdOnChain', { landIdOnChain });
//   }

//   if (lga) {
//     queryBuilder.andWhere('LOWER(land.lga) = LOWER(:lga)', { lga });
//   }

//   if (state) {
//     queryBuilder.andWhere('LOWER(land.state) = LOWER(:state)', { state });
//   }

//   return await queryBuilder.getMany();
// }

async search(searchLandDto: SearchLandDto) {
  const { currentOwner, id } = searchLandDto;

  if (!currentOwner || !id) {
    throw new BadRequestException("Both address and landIdOnChain are required");
  }

  return await this.landRepository
    .createQueryBuilder('land')
    .where('LOWER(land.currentOwner) = LOWER(:currentOwner)', { currentOwner })
    .andWhere('land.id = :id', { id })
    .getMany();
}

  update(id: number, updateLandDto: UpdateLandDto) {
    return `This action updates a #${id} land`;
  }

  remove(id: number) {
    return `This action removes a #${id} land`;
  }
}
