const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const userRepository = require('../repositories/userRepository');

async function login(username, password) {
  const user = await userRepository.getByUsername(username);
  if (!user) return null;

  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;

  return { userId: user.userId, username: user.username, role: user.role };
}

async function ensureSeedAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return;

  const existing = await userRepository.getByUsername(username);
  if (existing) return;

  const hash = await bcrypt.hash(password, 10);
  const user = {
    userId: uuidv4(),
    username,
    password: hash,
    role: 'admin',
    createdAt: new Date().toISOString()
  };
  await userRepository.create(user);
  console.log('Seeded admin user:', username);
}

async function ensureSeedStaff() {
  const username = process.env.STAFF_USERNAME;
  const password = process.env.STAFF_PASSWORD;
  if (!username || !password) return;

  const existing = await userRepository.getByUsername(username);
  if (existing) return;

  await createUser({ username, password, role: 'staff' });
  console.log('Seeded staff user:', username);
}

async function ensureSeedUsers() {
  await ensureSeedAdmin();
  await ensureSeedStaff();
}

async function createUser({ username, password, role = 'staff' }) {
  const hash = await bcrypt.hash(password, 10);
  const user = {
    userId: uuidv4(),
    username,
    password: hash,
    role,
    createdAt: new Date().toISOString()
  };
  await userRepository.create(user);
  return user;
}

async function getUserById(userId) {
  if (!userId) return null;
  return userRepository.getById(userId);
}

module.exports = { login, ensureSeedAdmin, ensureSeedStaff, ensureSeedUsers, createUser, getUserById };
