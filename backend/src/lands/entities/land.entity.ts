import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}
