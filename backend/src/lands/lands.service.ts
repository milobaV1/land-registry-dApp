import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Land } from './entities/land.entity';

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

  update(id: number, updateLandDto: UpdateLandDto) {
    return `This action updates a #${id} land`;
  }

  remove(id: number) {
    return `This action removes a #${id} land`;
  }
}
