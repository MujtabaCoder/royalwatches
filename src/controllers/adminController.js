// const jwtUtils = require('../jwt');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

const signup = async (req, res) => {
  try {
    const { fullName, mobileNumber, username, password, role, dob, address } = req.body;

    const existingUser = await Admin.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      fullName,
      mobileNumber,
      username,
      password: hashedPassword,
      role,
      dob,
      address,
    });
    const response = await newAdmin.save();
      
    return res.status(200).json({ message: 'Signup successful', username: response.username });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await Admin.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    req.session.userId = user._id;
    req.session.role = user.role;

    res.status(200).json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error(`Error during session destruction: ${err}`);
        return res.status(500).json({ message: 'Error logging out' });
      }

      return res.status(200).json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error(`Error in logout function: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const fetchUserData = async (req, res) => {
  try {
    const users = await Admin.find();
    res.render('admin', { users }); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const fetchUserDatademo = async (req, res) => {
  try {
    const users = await Admin.find();
    // console.log(users)
    res.render('ecom-customers', { users }); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteData = async(req,res)=>{ 

  const userId = req.params.userId;

    try {
       const deleteduser =  await Admin.findByIdAndDelete(userId);
        res.json({user: deleteduser}); 
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user.' });
    }
}

const updateuser =async (req,res)=>{
  const userId = req.params.userId;
        // console.log(userId)
        try {
          const user = await Admin.findById(userId);
          // console.log('User data:', user);

          if (user) {
            res.render('updateuser', { user });
        } else {
            res.status(404).send('User not found');
        }
      } catch (error) {
          console.error('Error while getting user data:', error);
          res.status(500).send('Internal server error');
      }
} 

const userUpdate = async(req,res)=>{

  const userId = req.params.userId;
    const { fullName, mobileNumber, username, role,address } = req.body;
    
    try {
        const updatedUser = await Admin.findByIdAndUpdate(userId, { fullName, mobileNumber, username, role,address }, { new: true });
        
        if (updatedUser) {
          // console.log(updatedUser)
            res.json({ message: 'User updated successfully', user: updatedUser });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error while updating user data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}
module.exports = { signup,login, logout,fetchUserData,deleteData,updateuser,userUpdate,fetchUserDatademo };

