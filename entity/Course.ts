import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class Task {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    url!: string

    @Column()
    numPersonsCompleted!: number

    @Column({
      type: 'jsonb',
      array: false,
      default: () => "'[]'",
      nullable: false,
    })
    public users!: Array<{ id: string }>
}
