/* eslint-disable import/prefer-default-export */
import { getConnection } from 'typeorm';

import UserAccount from '../entity/UserAccount';

// TODO: Could this call too early? Do we need to verify first connection was verified

export async function addPointsToUserScore(user: UserAccount, pointsToAdd: number): Promise<void> {
  const connection = getConnection();

  const userRepository = connection.getRepository(UserAccount);

  const foundUser = await userRepository.findOne({ id: user.id });
  if (!foundUser) { throw new Error('error in addPointsToUserScore'); }
  foundUser.score += pointsToAdd;
  await userRepository.save(foundUser);
}

export async function getUsersByScore(): Promise<UserAccount[]> {
  const connection = getConnection();
  const userRepository = connection.getRepository(UserAccount);
  const users = await userRepository.find();

  users.sort((a, b) => b.score - a.score);

  return users;
}
