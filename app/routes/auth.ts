import { Request, Response, Router } from 'express';
import passport from 'passport';
import prisma from '../prismaClient';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.json({
        error: true,
        message: 'Please provide all three of username, email and password',
      });
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: email }, { username: username }] },
    });
    if (user?.email === email)
      return res.json({
        error: true,
        message: 'This email is already registered',
      });
    if (user?.username === username)
      return res.json({
        error: true,
        message: 'This username is already taken',
      });
    const hash = await bcrypt.hash(password, 15);
    await prisma.user.create({
      data: {
        email: email,
        encrypted_password: hash,
        username: username,
        provider: 'EMAIL',
      },
    });
    return res.json({ error: false, message: 'User signed up successfully' });
  } catch (error) {
    return res.json({
      error: true,
      message: 'An error occured while processing your request',
    });
  }
});

router.post('/login', (req: Request, res: Response) => {
  passport.authenticate('local', function (err, user, message) {
    if (err || !user) {
      return res.json({ ...message });
    }
    req.logIn(user, function (err) {
      if (err) {
        return res.json({ message: 'Failed to log you in' });
      }
      return res.json({ ...message });
    });
  })(req, res);
});

router.get('/logout', (req: Request, res: Response) => {
  req.logOut();
  res.json({ message: 'Logged out successfully' });
});

router.get('/verify', (req: Request, res: Response) => {
  if (req.user)
    return res
      .json({
        message: 'You are authenticated',
        isAuthenticated: true,
        error: false,
      })
      .status(200);
  else
    return res.status(401).json({
      message: 'You are not authenticated',
      isAuthenticated: false,
      error: false,
    });
});

export default router;
