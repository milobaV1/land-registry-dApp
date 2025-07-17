import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import * as bcrypt from 'bcrypt'
import { Land } from "src/lands/entities/land.entity";

export enum KYCStatus{
    PENDING = 'pending',
    VERIFIED = 'verified',
    REJECTED = 'rejected',
}

@Entity()
export class User{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    wallet_address: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    dob: Date;

    @Column()
    nin: string;

    @Column({ type: 'enum', enum: KYCStatus, default: KYCStatus.PENDING })
    kycstatus: KYCStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Land, (land) => land.user)
    lands: Land[];

    @BeforeInsert()
    async hashNIN(){
        this.firstName = this.firstName.toLowerCase().trim();
        this.lastName = this.lastName.toLowerCase().trim();
        //this.nin = await bcrypt.hash(this.nin.trim(), 10)
    }

}