// Fake accounts, development only. They exist so there is something to log in as, and so the
// map has plausible engagement (visits, votes, reviews) before any real user shows up.
// Otherwise every tally on every spot reads zero and the views built in Phases 3-7 can't be
// told apart from broken ones.
//
// Passwords are plaintext HERE and nowhere else: seeds/index.js hands each one to
// User.register(), which is what derives the hash and salt. Nothing in this file reaches the
// database as written. They're all obviously-fake dev credentials on purpose: the seed
// script refuses to run against a non-local database precisely so these never escape.
//
// `role: 'admin'` is how the first curator account comes into existence. There is no route
// that grants the role (see models/user.js), so on a fresh database this file, or
// `npm run seed -- --admin <email>`, is the only path to one.
module.exports = [
    {
        username: 'samuel',
        email: 'samuel@scarlata.test',
        password: '123',
        role: 'admin',
    },
    {
        username: 'marifer',
        email: 'marifer@scarlata.test',
        password: 'scarlata-dev',
    },
    {
        username: 'dcastro',
        email: 'dcastro@scarlata.test',
        password: 'scarlata-dev',
    },
    {
        username: 'ana.rojas',
        email: 'ana.rojas@scarlata.test',
        password: 'scarlata-dev',
    },
    {
        username: 'kenneth',
        email: 'kenneth@scarlata.test',
        password: 'scarlata-dev',
    },
    {
        username: 'valeq',
        email: 'valeq@scarlata.test',
        password: 'scarlata-dev',
    },
    {
        username: 'josepablo',
        email: 'josepablo@scarlata.test',
        password: 'scarlata-dev',
    },
    {
        username: 'nat.vargas',
        email: 'nat.vargas@scarlata.test',
        password: 'scarlata-dev',
    },
];
