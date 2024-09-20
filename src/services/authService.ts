import User from '../models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ourfoodappjwtsecret';

interface AuthResponse {
  token: string;
  userType: string;
}

export const signUp = async (username: string, password: string): Promise<AuthResponse> => {
  const lowercaseUsername = username.toLowerCase();
  const existingUser = await User.findOne({ username: lowercaseUsername });
  if (existingUser) {
    throw new Error('Username already exists');
  }

  const user = new User({ username: lowercaseUsername, password, type: 'user' });
  await user.save();

  const token = jwt.sign({ userId: user._id, userType: user.type }, JWT_SECRET, { expiresIn: '1d' });
  return { token, userType: user.type };
};

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const lowercaseUsername = username.toLowerCase();
  const user = await User.findOne({ username: lowercaseUsername });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // If user doesn't have a type, set it to 'user'
  if (!user.type) {
    user.type = 'user';
    await user.save();
  }

  const token = jwt.sign({ userId: user._id, userType: user.type }, JWT_SECRET, { expiresIn: '1d' });
  return { token, userType: user.type };
};



// export const updateUsernamesToLowercase = async () => {
//   const users = await User.find({}).sort({ createdAt: 1 });
//   const seenUsernames = new Set();
//   const deletePromises = [];
//   const updatePromises = [];

//   for (const user of users) {
//     const lowercaseUsername = user.username.toLowerCase();
    
//     if (seenUsernames.has(lowercaseUsername)) {
//       // If we've seen this lowercase username before, delete this user
//       deletePromises.push(User.deleteOne({ _id: user._id }));
//       console.log(`Deleting duplicate user: ${user.username}`);
//     } else {
//       // If this is the first time we've seen this lowercase username
//       seenUsernames.add(lowercaseUsername);
      
//       if (user.username !== lowercaseUsername) {
//         // Update the username to lowercase if it's not already
//         updatePromises.push(User.updateOne(
//           { _id: user._id },
//           { $set: { username: lowercaseUsername } }
//         ));
//         console.log(`Updating username: ${user.username} to ${lowercaseUsername}`);
//       }
//     }
//   }

//   // Execute all delete and update operations
//   await Promise.all([...deletePromises, ...updatePromises]);

//   console.log('All usernames updated to lowercase and duplicates removed');
// };