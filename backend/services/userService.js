// Service layer - handles business logic
const userRepository = require('../repositories/userRepository.js');

const userService = {
  getAllUsers: async () => {
    return await userRepository.findAll();
  },

  getUserById: async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  createUser: async (userData) => {
    // Add business logic/validation here
    if (!userData.name || !userData.email) {
      throw new Error('Name and email are required');
    }
    return await userRepository.create(userData);
  },

  updateUser: async (id, userData) => {
    const user = await userRepository.update(id, userData);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  deleteUser: async (id) => {
    const deleted = await userRepository.delete(id);
    if (!deleted) {
      throw new Error('User not found');
    }
    return true;
  },
};

module.exports = userService;
