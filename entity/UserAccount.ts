import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class UserAccount {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    email!: string

    @Column()
    password!: string

    @Column()
    permissions!: string

    @Column()
    score!: number
}
