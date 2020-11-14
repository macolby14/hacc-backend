"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-underscore-dangle */
const typeorm_1 = require("typeorm");
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth_1 = __importDefault(require("passport-google-oauth"));
const UserAccount_1 = __importDefault(require("../entity/UserAccount"));
const keys_1 = __importDefault(require("./keys"));
typeorm_1.createConnection().then((connection) => {
    const userRepository = connection.getRepository(UserAccount_1.default);
    const GoogleStrategy = passport_google_oauth_1.default.OAuth2Strategy;
    passport_1.default.use(new GoogleStrategy({
        // options for the twitter start
        clientID: keys_1.default.GOOGLE_CLIENT_ID,
        clientSecret: keys_1.default.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.HOST}:${process.env.HOST_PORT}/auth/google/callback`,
    }, async (accessToken, refreshToken, profile, done) => {
        const currentUser = await userRepository.findOne({
            googleId: profile.id,
        });
        // create new user if the database doesn't have this user
        if (!currentUser) {
            const newUser = await new UserAccount_1.default();
            newUser.name = profile._json.name;
            newUser.googleId = profile.id;
            newUser.permissions = 'basic';
            newUser.score = 0;
            await userRepository.save(newUser);
            if (newUser) {
                done(null, newUser);
            }
        }
        done(null, currentUser);
    }));
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport_1.default.deserializeUser((id, done) => {
        const typedId = id;
        userRepository.findOne({ id: typedId }).then((user) => {
            done(null, user);
        }).catch((err) => {
            done(new Error(`Failed to deserialize user ${err}`));
        });
    });
});
//# sourceMappingURL=passport-setup.js.map