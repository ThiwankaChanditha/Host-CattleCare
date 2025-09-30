const User = require('../models/users');
const mongoose = require('mongoose');
const UserRole = require('../models/user_roles');
const bcrypt = require('bcrypt');

const getUser = async (req, res) => {
  try {
    console.log("req.query:", req.query);
    const { role, status } = req.query;
    console.log("getUser called with role:", role, "status:", status);
    let filter = {};
    if (role && role.toLowerCase() !== 'all') {
      const roleDoc = await UserRole.findOne({ role_name: role });
      console.log("Role document found:", roleDoc);
      if (roleDoc) {
        filter.role_id = roleDoc._id;
      } else {
        return res.status(200).json({ success: true, data: [] });
      }
    }
    if (status && status.toLowerCase() !== 'all') {
      if (status.toLowerCase() === 'active') filter.is_active = true;
      else if (status.toLowerCase() === 'inactive') filter.is_active = false;
    }

    const users = await User.find(filter)
      .populate({
        path: 'division_id',
        populate: {
          path: 'parent_division_id',
          populate: {
            path: 'parent_division_id',
            populate: {
              path: 'parent_division_id',
              populate: { path: 'parent_division_id' }
            }
          }
        }
      })
      .populate('role_id', 'role_name');

    const usersWithDivisionNames = users.map(user => {
      let province = '', district = '', vsDivision = '', ldiDivision = '', gnDivision = '';

      if (user.division_id) {
        const division = user.division_id;

        if (division.division_type === 'PD') province = division.division_name;
        else if (division.division_type === 'RD') {
          district = division.division_name;
          if (division.parent_division_id) province = division.parent_division_id.division_name;
        }
        else if (division.division_type === 'VS') {
          vsDivision = division.division_name;
          if (division.parent_division_id) {
            district = division.parent_division_id.division_name;
            if (division.parent_division_id.parent_division_id) {
              province = division.parent_division_id.parent_division_id.division_name;
            }
          }
        }
        else if (division.division_type === 'LDI') {
          ldiDivision = division.division_name;
          if (division.parent_division_id) {
            vsDivision = division.parent_division_id.division_name;
            if (division.parent_division_id.parent_division_id) {
              district = division.parent_division_id.parent_division_id.division_name;
              if (division.parent_division_id.parent_division_id.parent_division_id) {
                province = division.parent_division_id.parent_division_id.parent_division_id.division_name;
              }
            }
          }
        }
        else if (division.division_type === 'GN') {
          gnDivision = division.division_name;
          if (division.parent_division_id) {
            ldiDivision = division.parent_division_id.division_name;
            if (division.parent_division_id.parent_division_id) {
              vsDivision = division.parent_division_id.parent_division_id.division_name;
              if (division.parent_division_id.parent_division_id.parent_division_id) {
                district = division.parent_division_id.parent_division_id.parent_division_id.division_name;
                if (division.parent_division_id.parent_division_id.parent_division_id.parent_division_id) {
                  province = division.parent_division_id.parent_division_id.parent_division_id.parent_division_id.division_name;
                }
              }
            }
          }
        }
      }

      return {
        ...user.toObject(),
        province,
        district,
        vsDivision,
        ldiDivision,
        gnDivision,
        status: user.is_active ? 'active' : 'inactive'
      };
    });

    res.status(200).json({ success: true, data: usersWithDivisionNames });
  } catch (error) {
    console.log("error in fetching users:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


const getSingleUser = async (req, res) => {
  try {
    console.log("req.query1:", req.query);
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid User ID" });
    }

    const user = await User.findById(id)
      .populate('role_id', 'role_name')
      .populate('division_id');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching single user:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const createUser = async (req, res) => {
  const user = req.body;
  console.log("Received user data:", user);

  const requiredFields = ['username', 'full_name', 'email', 'role_name', 'nic'];
  for (const field of requiredFields) {
    if (!user[field]) {
      console.log(`Missing required field: ${field}`);
      return res.status(400).json({ success: false, message: `Please fill the field: ${field}` });
    }
  }

  if (user.is_active === undefined) user.is_active = true;

  try {
    const role = await UserRole.findOne({ role_name: user.role_name });
    if (!role) return res.status(400).json({ success: false, message: 'Invalid role_name provided' });

    user.role_id = role._id;
    delete user.role_name;

    if (user.division_id === '') user.division_id = undefined;

    const newUser = new User(user);
    await newUser.save();
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error("Error in create user:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

const updatedUser = async (req, res) => {
  const { id } = req.params;
  const user = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ success: false, message: "Invalid User ID" });

  const requiredFields = ['username', 'full_name', 'email', 'role_name', 'nic'];
  for (const field of requiredFields) {
    if (!user[field]) return res.status(400).json({ success: false, message: `Please fill the field: ${field}` });
  }

  try {
    const role = await UserRole.findOne({ role_name: user.role_name });
    if (!role) return res.status(400).json({ success: false, message: 'Invalid role_name provided' });

    user.role_id = role._id;
    delete user.role_name;

    if (user.status) {
      if (user.status.toLowerCase() === 'active') user.is_active = true;
      else if (user.status.toLowerCase() === 'inactive') user.is_active = false;
      else user.is_active = false;
      delete user.status;
    }

    if (user.province || user.district || user.region) {
      delete user.province;
      delete user.district;
      delete user.region;
    }

    const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error in update user:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ success: false, message: "Invalid User ID" });

  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "user deleted successfully" });
  } catch (error) {
    console.error("Error in deleting users:", error.message);
    res.status(500).json({ success: false, message: "User not found" });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password are required' });

  try {
    const user = await User.findOne({ username }).populate('role_id', 'role_name');

    if (!user) return res.status(401).json({ success: false, message: 'Invalid username or password' });

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Invalid username or password' });

    if (!user.is_active) return res.status(401).json({ success: false, message: 'Account is deactivated' });

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role_name: user.role_id?.role_name,
      role_id: user.role_id,
      is_active: user.is_active,
      created_at: user.created_at
    };

    res.status(200).json({ success: true, message: 'Login successful', data: userData });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

module.exports = {
  getUser,
  getSingleUser,
  createUser,
  updatedUser,
  deleteUser,
  loginUser
};