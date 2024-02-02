import crypto from 'crypto';
import { Entity, Index, Column,  BeforeInsert, OneToOne, JoinColumn } from 'typeorm';
import Model from './model.entity'; 
import bcrypt from 'bcryptjs';// Assuming Model is defined in a separate file
import { UserProfile } from './userProfile.entity';

@Entity('users')
export class User extends Model {
    // @PrimaryGeneratedColumn('uuid')
    // id: string;
    @Index('email_index')
    @Column({
      unique: true,
    })
    email: string;
  
    @Column()
    password: string;
    @OneToOne(() => UserProfile)
    @JoinColumn()
    userprofile: UserProfile;
    @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }

  static async comparePasswords(
    candidatePassword: string,
    hashedPassword: string
  ) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  static createVerificationCode() {
    const verificationCode = crypto.randomBytes(32).toString('hex');

    const hashedVerificationCode = crypto
      .createHash('sha256')
      .update(verificationCode)
      .digest('hex');

    return { verificationCode, hashedVerificationCode };
  }

}
