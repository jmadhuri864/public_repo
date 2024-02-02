

import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User} from './user.entity';


@Entity('userprofile')
export class UserProfile {
    @PrimaryGeneratedColumn('uuid')
   id: string;
   @Column({
    default: 'default-post.png',
  })
  image: string;
  @Column()
  fullName: string;

  @Column()
  nickname: string;

  @Column({type:'date'})
  dateOfBirth: Date;

  @Column({ unique: true })
  email: string;

  @Column()
  mobileNumber: string;

  @Column()
  gender: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
