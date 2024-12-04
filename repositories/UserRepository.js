const User = require('../models/User');
const { InvalidObjectIdError } = require('../utils/customErrors');
const { isValidObjectId } = require('../utils/helper');

class UserRepository {
  
  static async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  static async getFriendsFields(userId) {
    const user = await User.findById(userId, 'friendRequest friends')
      .populate({
        path: 'friends',
        populate: {
          path: 'person',
        }
      });

    if (!user) {
      throw new Error('User not found');
    }

    const { friendRequest, friends } = user;
    console.log('Friends:', friends);
    // Map friends to the desired JSON format
    const formattedFriends = friends.map(friend => ({
      firstName: friend.person.generalInformation.firstName,
      lastName: friend.person.generalInformation.lastName,
      profilePicture: friend.person.profilePicture,
      userId: friend._id.toString()
    }));

    console.log('Formatted friends:', formattedFriends);

    return { friendRequest, friends: formattedFriends };
}

  static async findUserByUsername(username) {
    return await User.findOne({ username }).exec();
  }

  static async findUserById(userId) {
    if (!isValidObjectId(userId)) {
      throw new InvalidObjectIdError('Invalid User ID');
    }
    return await User.findById(userId);
  }

  static async getAllUsersWithFamilyTree() {
    return await User.find({})
      .populate({
        path: 'familyTree',
        populate: {
          path: 'root',
          populate: [
            { path: 'person' },
            { path: 'parents', populate: { path: 'person' } },
            { path: 'children', populate: { path: 'person' } }
          ]
        }
      })
      .exec();
  }

  static async getAllUsers() {
    return await User.find({}).exec();
  }
}

module.exports = UserRepository;