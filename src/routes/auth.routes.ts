import express from 'express';
import {
  
  createUserProfile,
  loginUserHandler,
  logoutHandler,
  refreshAccessTokenHandler,
  registerUserHandler,
} from '../controller/userRegistration.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { validate } from '../middleware/validate';
import { createUserSchema, loginUserSchema, userProfileSchema} from '../schemas/user.schema';

const router = express.Router();

// Register user
router.post('/register', validate(createUserSchema), registerUserHandler);

router.post('/profile',validate(userProfileSchema),createUserProfile)
// Login user
 router.post('/login', validate(loginUserSchema), loginUserHandler);

// // Logout user
router.get('/logout', deserializeUser, requireUser, logoutHandler);

// Refresh access token
router.get('/refresh', refreshAccessTokenHandler);

export default router;

