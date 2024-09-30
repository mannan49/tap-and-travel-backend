import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './userModel.js';
import config from '../../config/index.js';

const getNextUserId = async () => {
  try {
    const result = await User.aggregate([{ $group: { _id: null, maxId: { $max: "$userId" } } }]);
    return result.length > 0 ? result[0].maxId + 1 : 1;
  } catch (err) {
    throw new Error("Error fetching next user ID");
  }
};

const addUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({ status: 400, message: errors.array().map((err) => err.msg).join(', ') });
  }

  try {
    const { name, email, password, phoneNumber, RFIDCardNumber, travelHistory, paymentInformation } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userId: await getNextUserId(),
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      RFIDCardNumber,
      travelHistory,
      paymentInformation,
    });

    const savedUser = await newUser.save();
    const token = jwt.sign({ sub: savedUser._id }, config.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ user: savedUser, token });
  } catch (err) {
    if (err.name === 'MongoError' && err.code === 11000) {
      return next({ status: 400, message: 'Email already exists' });
    }
    return next({ status: 500, message: err.message });
  }
};

const loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({ status: 400, message: errors.array().map((err) => err.msg).join(', ') });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next({ status: 401, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next({ status: 401, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ sub: user._id }, config.JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    return res.status(200).json({ message: 'Users fetched successfully', users });
  } catch (err) {
    return next({ status: 500, message: 'Error fetching users' });
  }
};

export { addUser, loginUser, getAllUsers };
