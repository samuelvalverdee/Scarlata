// Seed script. Wipes and rebuilds the development database:
//
//   npm run seed                     users + spots
//   npm run seed -- --with-activity  ...plus fake visits, votes and reviews
//   npm run seed -- --admin <email>  promote one existing account, wipe nothing
//   npm run seed -- --force          allow a non-local MONGO_URI (see assertLocalTarget)
//
// Spots are seeded here rather than submitted by users because they're curated. That is the
// whole ownership decision in models/spot.js. This file is one of the two write paths that
// exist for the Spot collection; the admin routes are the other.
require('dotenv').config();

const { parseArgs } = require('node:util');
const mongoose = require('mongoose');

const connectDB = require('../db/connection');
const Spot = require('../models/spot');
const User = require('../models/user');
const Review = require('../models/review');
const SpotEntry = require('../models/spotEntry');

const spotSeeds = require('./spots');
const userSeeds = require('./users');

const { values: flags } = parseArgs({
    options: {
        force: { type: 'boolean', default: false },
        'with-activity': { type: 'boolean', default: false },
        admin: { type: 'string' },
    },
});

// Every collection below gets deleteMany({}). A typo in .env pointed at a shared or deployed
// database would empty it with no confirmation and no undo, so the destructive path is opt-in
// for anything that isn't clearly a local mongod. --force is the deliberate override.
const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '::1', 'mongo', 'mongodb'];

function assertLocalTarget(uri) {
    const { hostname } = new URL(uri);
    if (LOCAL_HOSTNAMES.includes(hostname)) return;
    throw new Error(
        `Refusing to seed ${hostname}: this script deletes every document in the users, spots, ` +
        `entries and reviews collections.\nRe-run with --force if you really mean to.`,
    );
}

async function main() {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not set. Copy server/.env.example to server/.env');
    if (!flags.force) assertLocalTarget(uri);

    await connectDB(uri);
    const { host, pathname } = new URL(uri);
    console.log(`Connected to ${host}${pathname}`);

    // Promotion is a separate mode, not a step of the seed, because the account worth
    // promoting is usually one you just registered through the API against a database you
    // don't want to lose.
    if (flags.admin) return promoteAdmin(flags.admin);

    await wipe();
    const users = await seedUsers();
    const spots = await seedSpots();
    if (flags['with-activity']) await seedActivity(users, spots);

    console.log('\nDone. Log in with any seeded email and the password in seeds/users.js.');
}

async function wipe() {
    const [entries, reviews, spots, users] = await Promise.all([
        SpotEntry.deleteMany({}),
        Review.deleteMany({}),
        Spot.deleteMany({}),
        User.deleteMany({}),
    ]);
    console.log(
        `Cleared ${users.deletedCount} users, ${spots.deletedCount} spots, ` +
        `${entries.deletedCount} entries, ${reviews.deletedCount} reviews`,
    );
}

// User.register() rather than insertMany(): passport-local-mongoose derives `hash` and `salt`
// inside register(). Documents written straight into the collection would exist, pass
// validation, and then be unable to log in, the most confusing possible failure.
async function seedUsers() {
    const users = [];
    for (const { password, ...fields } of userSeeds) {
        users.push(await User.register(new User(fields), password));
    }
    const admins = users.filter((u) => u.role === 'admin').map((u) => u.email);
    console.log(`Seeded ${users.length} users (admin: ${admins.join(', ') || 'none'})`);
    return users;
}

// `addedBy` is left unset: these spots predate every account, so pointing them at the seeded
// admin would claim a curation that never happened. The field is only for spots added later
// through the admin routes, which is why models/spot.js makes it optional.
async function seedSpots() {
    const spots = await Spot.insertMany(spotSeeds);
    console.log(`Seeded ${spots.length} spots`);
    return spots;
}

// The one deliberately non-hardcoded corner of the seed. Fake engagement has to be uneven:
// some spots busy, some untouched, votes not unanimous. Otherwise the map, the tallies and the
// progress counts all look identical and none of them prove anything. Uneven but reproducible
// though: a fixed-seed generator means a reseed rebuilds the same database, so a number that
// changed is a regression rather than new dice.

// mulberry32. The textbook `state * 1103515245 + 12345` LCG is wrong in JavaScript: that
// multiply lands past Number.MAX_SAFE_INTEGER, so the low bits are quietly rounded away and
// the sequence sheds entropy. Math.imul multiplies as int32 on purpose, which keeps every
// step exact.
function makeRandom(seed = 20260905) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const NOTES = [
    'Salimos temprano, valio cada paso.',
    'Trail was muddy after the rain - boots, not tennis shoes.',
    'Llegamos al mediodia y estaba lleno. Ir antes de las 8.',
    'Second time here and still worth it.',
    'Water was freezing. Went in anyway.',
];

const REVIEW_BODIES = [
    'Exactly as described. Easy to find and the drive in was fine in a normal car.',
    'Beautiful, but go early - by 10am it is packed and you lose the whole point of it.',
    'Harder than I expected. Fine if you hike regularly, rough if you do not.',
    'One of those places you end up bringing everyone you know back to.',
    'Good half-day trip from San Jose. Bring cash, there is no signal for card readers.',
    'Worth it, though the last stretch of road is not for a sedan.',
];

async function seedActivity(users, spots) {
    if (!spots.length) {
        console.log('No spots to attach activity to - skipping.');
        return;
    }

    const rand = makeRandom();
    const pick = (arr) => arr[Math.floor(rand() * arr.length)];
    const entries = [];
    const reviews = [];

    for (const spot of spots) {
        for (const user of users) {
            if (rand() > 0.35) continue; // most people haven't been to most places

            const visited = rand() < 0.7;
            // A vote only means anything on a visited spot; models/spotEntry.js rejects the
            // combination outright, and insertMany runs that validator.
            const voted = visited && rand() < 0.8;

            entries.push({
                user: user._id,
                spot: spot._id,
                status: visited ? 'visited' : 'want',
                vote: voted ? (rand() < 0.85 ? 1 : -1) : null,
                logs: visited
                    ? [{
                        visitedAt: new Date(Date.now() - Math.floor(rand() * 730) * 86400000),
                        activitiesDone: spot.activityTypes.length ? [pick(spot.activityTypes)] : [],
                        notes: pick(NOTES),
                    }]
                    : [],
            });

            // Reviews are gated on a visit by the hasVisited middleware. The seed honours the
            // same rule so the data can't describe a state the API would never produce.
            if (visited && rand() < 0.5) {
                reviews.push({
                    spot: spot._id,
                    author: user._id,
                    rating: rand() < 0.75 ? 4 + Math.round(rand()) : 2 + Math.round(rand()),
                    body: pick(REVIEW_BODIES),
                });
            }
        }
    }

    await SpotEntry.insertMany(entries);
    await Review.insertMany(reviews);
    const visits = entries.filter((e) => e.status === 'visited').length;
    console.log(`Seeded ${entries.length} entries (${visits} visited), ${reviews.length} reviews`);
}

// The only way an account becomes an admin. No route grants the role (see models/user.js),
// so this stays an operator action taken against the database, not something the API can be
// talked into.
async function promoteAdmin(email) {
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (!user) throw new Error(`No account registered with email ${email}`);
    console.log(`${user.email} is now an admin.`);
}

main()
    .catch((err) => {
        console.error(`\n${err.message}`);
        process.exitCode = 1;
    })
    .finally(() => mongoose.connection.close());
