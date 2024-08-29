const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Person = require('../models/person')

// Create a new user
usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  if (!username || !password) {
    console.log('Validation failed: Username or password missing');
    return response.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      name,
      passwordHash,
    });

    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    console.error('Error saving user:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all users and populate notes, children, and parents
usersRouter.get('/', async (request, response) => {
  try {
    const users = await User.find({}).exec(); 
    const populatedUsers = await Promise.all(users.map(async (user) => {
      const relations = await Person.find({ relatedUser: user._id }).select('name birthdate deathdate relatedUser').lean();

      return {
        ...user.toJSON(), 
        relations 
      };
    }));

    response.json(populatedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    response.status(500).json({ error: 'Something went wrong' });
  }
});



module.exports = usersRouter