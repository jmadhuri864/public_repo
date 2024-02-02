import { CookieOptions, NextFunction, Request, Response } from 'express';
import config from 'config';
import crypto from 'crypto';
import {
  CreateUserInput, LoginUserInput,
 // LoginUserInput,
  //VerifyEmailInput,
} from '../schemas/user.schema';
import {
  createUser,
  findUser,
  findUserByEmail,
  findUserById,
  signTokens,
  saveUserProfile
} from '../services/user.service';
import AppError from '../utils/appError';
import redisClient from '../utils/connectRedis';
import { signJwt, verifyJwt } from '../utils/jwt';
import { User } from '../entities/user.entity';
import { UserProfile } from '../entities/userProfile.entity';
import multer from 'multer';
import sharp from 'sharp';
//import Email from '../utils/email';

const cookiesOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
};

if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true;

const accessTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>('accessTokenExpiresIn') * 60 * 1000
  ),
  maxAge: config.get<number>('accessTokenExpiresIn') * 60 * 1000,
};

const refreshTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>('refreshTokenExpiresIn') * 60 * 1000
  ),
  maxAge: config.get<number>('refreshTokenExpiresIn') * 60 * 1000,
};

export const registerUserHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {  password, email } = req.body;

    const newUser = await createUser({
    
      email: email.toLowerCase(),
      password,
    });

    
    await newUser.save();

    // Send Verification Email
    
    
   
    
  }
  catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({
        status: 'fail',
        message: 'User with that email already exist',
      });
    }
    next(err);
  }};

//createuserprofile
export const createUserProfile = async (req: Request, res: Response) => {
  try {
    const { fullName, nickname, dateOfBirth, mobileNumber, gender, email,image } = req.body;

    // Find the user by email
    const user = await findUserByEmail({ email });
     console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new user profile
    const userProfile = new UserProfile();
    userProfile.fullName = fullName;
    userProfile.nickname = nickname;
    userProfile.dateOfBirth = dateOfBirth;
    userProfile.mobileNumber = mobileNumber;
    userProfile.gender = gender;
    userProfile.email=email;
    userProfile.image=image;
    userProfile.user = user;

    await saveUserProfile(userProfile);

    res.status(201).json({ message: 'User profile created successfully' });
  } catch (error) {
    console.error('Error creating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
    

   

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    const message = 'Could not refresh access token';

    if (!refresh_token) {
      return next(new AppError(403, message));
    }

    // Validate refresh token
    const decoded = verifyJwt<{ sub: string }>(
      refresh_token,
      'refreshTokenPublicKey'
    );

    if (!decoded) {
      return next(new AppError(403, message));
    }

    // Check if user has a valid session
    const session = await redisClient.get(decoded.sub);

    if (!session) {
      return next(new AppError(403, message));
    }

    // Check if user still exist
    const user = await findUserById(JSON.parse(session).id);

    if (!user) {
      return next(new AppError(403, message));
    }

    // Sign new access token
    const access_token = signJwt({ sub: user.id }, 'accessTokenPrivateKey', {
    //console.log();
      expiresIn: `${config.get<number>('accessTokenExpiresIn')}m`,
    });
console.log(access_token)
    // 4. Add Cookies
    res.cookie('access_token', access_token, accessTokenCookieOptions);
    res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // 5. Send response
    res.status(200).json({
      status: 'success',
      access_token,
    });
  } catch (err: any) {
    next(err);
  }
};

const logout = (res: Response) => {
  res.cookie('access_token', '', { maxAge: 1 });
  res.cookie('refresh_token', '', { maxAge: 1 });
  res.cookie('logged_in', '', { maxAge: 1 });
};

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;

    await redisClient.del(user.id);
    logout(res);

    res.status(200).json({
      status: 'success',
    });
  } catch (err: any) {
    next(err);
  }
};
//login handler
export const loginUserHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail({ email });

    // 1. Check if user exist
    if (!user) {
      return next(new AppError(400, 'Invalid email or password'));
    }

    
    

    //2. Check if password is valid
    if (!(await User.comparePasswords(password, user.password))) {
      return next(new AppError(400, 'Invalid email or password'));
    }
  
    // 3. Sign Access and Refresh Tokens
    const { access_token, refresh_token } = await signTokens(user);

    // 4. Add Cookies
    res.cookie('access_token', access_token, accessTokenCookieOptions);
    res.cookie('refresh_token', refresh_token, refreshTokenCookieOptions);
    res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // 5. Send response
    res.status(200).json({
      status: 'success',
      access_token,
    });
  } catch (err: any) {
    next(err);
  }
};

//profile picture
const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!file.mimetype.startsWith('image')) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
  }

};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5000000, files: 1 },
});

export const uploadPostImage = upload.single('image');

export const resizePostImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;
    if (!file) return next();

    const user = res.locals.user;

    const fileName = `user-${user.id}-${Date.now()}.jpeg`;
    await sharp(req.file?.buffer)
      .resize(800, 450)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`${__dirname}/../../public/posts/${fileName}`);

    req.body.image = fileName;

    next();
  } catch (err: any) {
    next(err);
  }
};

