var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable import/prefer-default-export */
import { getConnection } from 'typeorm';
import UserAccount from '../entity/UserAccount';
// TODO: Could this call too early? Do we need to verify first connection was verified
export function addPointsToUserScore(user, pointsToAdd) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = getConnection();
        const userRepository = connection.getRepository(UserAccount);
        const foundUser = yield userRepository.findOne({ id: user.id });
        if (!foundUser) {
            throw new Error('error in addPointsToUserScore');
        }
        foundUser.score += pointsToAdd;
        yield userRepository.save(foundUser);
    });
}
export function getUsersByScore() {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = getConnection();
        const userRepository = connection.getRepository(UserAccount);
        const users = yield userRepository.find();
        users.sort((a, b) => b.score - a.score);
        return users;
    });
}
//# sourceMappingURL=user.js.map