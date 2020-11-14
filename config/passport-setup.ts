/* eslint-disable no-underscore-dangle */
import { createConnection } from 'typeorm';

import passport from 'passport';
import PassportGoogle from 'passport-google-oauth';
import UserAccount from '../entity/UserAccount';
import keys from './keys';

createConnection().then((connection) => {
  const userRepository = connection.getRepository(UserAccount);

  const GoogleStrategy = PassportGoogle.OAuth2Strategy;

  passport.use(
    new GoogleStrategy(
      {
      // options for the twitter start
        clientID: keys.GOOGLE_CLIENT_ID,
        clientSecret: keys.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://www.example.com/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const currentUser = await userRepository.findOne({
          googleId: profile.id,
        });
        // create new user if the database doesn't have this user
        if (!currentUser) {
          const newUser = await new UserAccount();
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
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, (user as UserAccount).id);
  });

  passport.deserializeUser((id, done) => {
    const typedId = id as number;
    userRepository.findOne({ id: typedId }).then((user) => {
      done(null, user);
    }).catch((err) => {
      done(new Error(`Failed to deserialize user ${err}`));
    });
  });
});
