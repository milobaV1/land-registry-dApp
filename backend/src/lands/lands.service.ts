import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Land } from './entities/land.entity';
import { SearchLandDto } from './dto/search-land-dto';

@Injectable()
export class LandsService {
  constructor(
    @InjectRepository(Land)
    private readonly landRepository: Repository<Land>
  ){}

  async create(createLandDto: CreateLandDto) {
    const existingLand = await this.findOne('landIdOnChain', createLandDto.landIdOnChain);
    if (existingLand) throw new BadRequestException('Land already exists');
    const newLand = this.landRepository.create(createLandDto);
    const savedLand = this.landRepository.save(newLand)
    return savedLand
  }

  findAll() {
    return `This action returns all lands`;
  }

  async findOne(searchParam: 'landIdOnChain' | 'id', searchValue: string | number) {
    const land = await this.landRepository.findOne({
      where: { [searchParam]: searchValue }
    })
    return land;
  }

  async findByAddress(address: string){
    const land = await this.landRepository.find({
      where: { currentOwner: address },
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
  const { currentOwner, landIdOnChain } = searchLandDto;

  if (!currentOwner || !landIdOnChain) {
    throw new BadRequestException("Both address and landIdOnChain are required");
  }

  return await this.landRepository
    .createQueryBuilder('land')
    .where('LOWER(land.currentOwner) = LOWER(:currentOwner)', { currentOwner })
    .andWhere('land.landIdOnChain = :landIdOnChain', { landIdOnChain })
    .getMany();
}

  update(id: number, updateLandDto: UpdateLandDto) {
    return `This action updates a #${id} land`;
  }

  remove(id: number) {
    return `This action removes a #${id} land`;
  }
}
