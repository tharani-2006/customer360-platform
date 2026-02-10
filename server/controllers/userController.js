const User = require('../models/User');
const { ROLES } = require('../config/constants');

const toUserResponse = (u) => ({
  id: u._id,
  email: u.email,
  fullName: u.fullName,
  role: u.role,
  isActive: u.isActive,
  createdAt: u.createdAt,
});

const listUsers = async (req, res, next) => {
  try {
    const raw = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const users = raw.map(toUserResponse);

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;
    const user = await User.create({
      fullName: fullName?.trim() || '',
      email,
      password,
      role: role || ROLES.VIEWER,
      isActive: true,
    });

    const created = await User.findById(user._id).select('-password').lean();
    res.status(201).json({
      success: true,
      data: { user: toUserResponse(created) },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, role, isActive } = req.body;

    if (String(req.user._id) === String(id) && isActive === false) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    const update = {};
    if (fullName !== undefined) update.fullName = fullName?.trim() || '';
    if (role !== undefined) update.role = role;
    if (isActive !== undefined) update.isActive = Boolean(isActive);

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    )
      .select('-password')
      .lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      data: { user: toUserResponse(updated) },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, createUser, updateUser };
