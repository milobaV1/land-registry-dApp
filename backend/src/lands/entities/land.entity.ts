import { User } from "src/users/entities/user.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum LandUse {
    RESIDENTIAL = 'residential',
    INDUSTRIAL = 'industrial',
}

@Entity()
export class Land {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    currentOwner: string;

    @Column()
    landAddress: string;

    @Column()
    dateOfIssuance: Date;

    @Column()
    state: string;

    @Column()
    lga: string;

    @Column()
    area: number;

    @Column({type: 'enum', enum: LandUse, default: LandUse.RESIDENTIAL})
    landUse: LandUse;

    @Column({default: false})
    isVerified: boolean;

    @Column({unique: true})
    landIdOnChain: number;

    @CreateDateColumn()
    registrationDate: Date;

    @ManyToOne(() => User, (user) => user.lands, { onDelete: 'CASCADE' })
    user: User;

    @BeforeInsert()
    async lowerCase(){
        this.landAddress = this.landAddress.toLowerCase();
        this.state = this.state.toLowerCase().trim();
        this.lga = this.lga.toLowerCase().trim();
    }
    
}
