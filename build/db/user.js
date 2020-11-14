"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersByScore = exports.addPointsToUserScore = void 0;
/* eslint-disable import/prefer-default-export */
const typeorm_1 = require("typeorm");
const UserAccount_1 = __importDefault(require("../entity/UserAccount"));
// TODO: Could this call too early? Do we need to verify first connection was verified
async function addPointsToUserScore(user, pointsToAdd) {
    const connection = typeorm_1.getConnection();
    const userRepository = connection.getRepository(UserAccount_1.default);
    const foundUser = await userRepository.findOne({ id: user.id });
    if (!foundUser) {
        throw new Error('error in addPointsToUserScore');
    }
    foundUser.score += pointsToAdd;
    await userRepository.save(foundUser);
}
exports.addPointsToUserScore = addPointsToUserScore;
async function getUsersByScore() {
    const connection = typeorm_1.getConnection();
    const userRepository = connection.getRepository(UserAccount_1.default);
    const users = await userRepository.find();
    users.sort((a, b) => b.score - a.score);
    return users;
}
exports.getUsersByScore = getUsersByScore;
//# sourceMappingURL=user.js.map