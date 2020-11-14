var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable no-underscore-dangle */
import { createConnection } from 'typeorm';
import passport from 'passport';
import PassportGoogle from 'passport-google-oauth';
import UserAccount from '../entity/UserAccount';
import keys from './keys';
createConnection().then((connection) => {
    const userRepository = connection.getRepository(UserAccount);
    const GoogleStrategy = PassportGoogle.OAuth2Strategy;
    passport.use(new GoogleStrategy({
        // options for the twitter start
        clientID: keys.GOOGLE_CLIENT_ID,
        clientSecret: keys.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.HOST}:${process.env.HOST_PORT}/auth/google/callback`,
    }, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        const currentUser = yield userRepository.findOne({
            googleId: profile.id,
        });
        // create new user if the database doesn't have this user
        if (!currentUser) {
            const newUser = yield new UserAccount();
            newUser.name = profile._json.name;
            newUser.googleId = profile.id;
            newUser.permissions = 'basic';
            newUser.score = 0;
            yield userRepository.save(newUser);
            if (newUser) {
                done(null, newUser);
            }
        }
        done(null, currentUser);
    })));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        const typedId = id;
        userRepository.findOne({ id: typedId }).then((user) => {
            done(null, user);
        }).catch((err) => {
            done(new Error(`Failed to deserialize user ${err}`));
        });
    });
});
//# sourceMappingURL=passport-setup.js.map