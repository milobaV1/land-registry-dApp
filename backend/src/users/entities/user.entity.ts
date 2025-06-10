import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import * as bcrypt from 'bcrypt'

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

    @BeforeInsert()
    async hashNIN(){
        this.firstName = this.firstName.toLowerCase().trim();
        this.lastName = this.lastName.toLowerCase().trim();
        //this.nin = await bcrypt.hash(this.nin.trim(), 10)
    }

}