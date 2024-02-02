import config from 'config';
import { User } from '../entities/user.entity';
import { CreateUserInput } from '../schemas/user.schema';
import { UserProfileSchema } from '../schemas/user.schema';
import redisClient from '../utils/connectRedis';
import { AppDataSource } from '../utils/data-source';
import { signJwt } from '../utils/jwt';
import { UserProfile } from '../entities/userProfile.entity';

const userRepository = AppDataSource.getRepository(User);
const userProfileRepository = AppDataSource.getRepository(UserProfile)
export const createUser = async (input: CreateUserInput) => {
  return (await AppDataSource.manager.save(
    AppDataSource.manager.create(User, input)
  )) as User;
};

export const saveUserProfile = async (input: UserProfileSchema) => {
  return await userProfileRepository.save(input)
};

export const findUserByEmail = async ({ email }: { email: string }) => {
  return await userRepository.findOneBy({ email });
};

export const findUserById = async (userId: string) => {
  return await userRepository.findOneBy({ id: userId });
};

export const findUser = async (query: Object) => {
  return await userRepository.findOneBy(query);
};

// (...)
// ? Sign access and Refresh Tokens
export const signTokens = async (user: User) => {
    // 1. Create Session
    redisClient.set(user.id, JSON.stringify(user), {
      EX: config.get<number>('redisCacheExpiresIn') * 60,
    });
  
    // 2. Create Access and Refresh tokens
    const access_token = signJwt({ sub: user.id }, 'accessTokenPrivateKey', {
      expiresIn: `${config.get<number>('accessTokenExpiresIn')}m`,
    });
  
    const refresh_token = signJwt({ sub: user.id }, 'refreshTokenPrivateKey', {
      expiresIn: `${config.get<number>('refreshTokenExpiresIn')}m`,
    });
  console.log("accesstoken : ",access_token);
  console.log("refresh token ",refresh_token)
    return { access_token, refresh_token };
  };