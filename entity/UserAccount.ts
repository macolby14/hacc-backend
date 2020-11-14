import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class UserAccount {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    googleId!: string

    @Column()
    name!: string

    @Column()
    permissions!: string

    @Column()
    score!: number
}
