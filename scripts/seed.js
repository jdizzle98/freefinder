/**
 * Seed the Supabase database with realistic fake data for local/dev use:
 * 8 users, 20 listings (across all categories), listing photos,
 * and 10 reviews, all centered around Orlando, FL.
 *
 * SAFETY
 * - This uses the Supabase SERVICE ROLE KEY, which bypasses all RLS policies
 *   and can create real auth users. Only ever point this at a dev/test
 *   Supabase project - never production.
 * - Add SUPABASE_SERVICE_ROLE_KEY to your .env.local (Supabase dashboard ->
 *   Project Settings -> API -> "service_role" secret). Do NOT prefix it with
 *   NEXT_PUBLIC_ (that would bundle it into client-side JS) and never commit
 *   it - .env.local is already gitignored.
 * - Not idempotent: re-running will fail on duplicate emails rather than
 *   silently double-seeding. That's intentional for a one-off dev seed.
 *
 * USAGE
 *   node --env-file=.env.local scripts/seed.js
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.\n' +
    'Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase dashboard -> ' +
    'Project Settings -> API -> "service_role" secret), then run:\n' +
    '  node --env-file=.env.local scripts/seed.js'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Orlando, FL city center. Listings are jittered around this point.
const ORLANDO = { lat: 28.5383, lng: -81.3792 };

function jitteredCoordinate(center, spreadDegrees) {
  return center + (Math.random() - 0.5) * spreadDegrees;
}

function randomPassword() {
  return crypto.randomBytes(16).toString('hex');
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const FAKE_USERS = [
  { firstName: 'Emma', lastName: 'Rodriguez', age: 29, city: 'Orlando' },
  { firstName: 'Marcus', lastName: 'Chen', age: 34, city: 'Winter Park' },
  { firstName: 'Sophia', lastName: 'Patel', age: 26, city: 'Lake Nona' },
  { firstName: 'Jacob', lastName: 'Williams', age: 41, city: 'Kissimmee' },
  { firstName: 'Olivia', lastName: 'Martinez', age: 31, city: 'College Park' },
  { firstName: 'Ethan', lastName: 'Johnson', age: 45, city: 'Altamonte Springs' },
  { firstName: 'Ava', lastName: 'Thompson', age: 23, city: 'Baldwin Park' },
  { firstName: 'Noah', lastName: 'Garcia', age: 37, city: 'Dr. Phillips' },
];

const FAKE_LISTINGS = [
  // Furniture
  {
    category: 'Furniture',
    title: 'Mid-Century Modern Sofa',
    description: 'Comfortable 3-seater sofa in great condition, minor wear on the armrests. Must pick up, no delivery.',
  },
  {
    category: 'Furniture',
    title: 'Solid Wood Dining Table',
    description: 'Seats 4-6 people, sturdy oak dining table. A few scratches on the top but very solid.',
  },
  {
    category: 'Furniture',
    title: 'IKEA Bookshelf (Billy)',
    description: 'White Billy bookshelf, 5 shelves, disassembled and ready for easy transport.',
  },
  {
    category: 'Furniture',
    title: 'Queen Size Bed Frame',
    description: 'Metal bed frame, no mattress included. Some rust on the legs but fully functional.',
  },
  // Clothing
  {
    category: 'Clothing',
    title: "Men's Winter Jacket (L)",
    description: 'Warm winter coat, barely worn, size Large. Great for the rare cold Florida nights.',
  },
  {
    category: 'Clothing',
    title: "Women's Dress Bundle",
    description: '5 summer dresses, size M, various colors. Great for someone starting a new wardrobe.',
  },
  {
    category: 'Clothing',
    title: 'Kids Clothes Lot (Size 6-7)',
    description: 'Mixed bag of gently used kids clothing, shirts and shorts, from a smoke-free home.',
  },
  {
    category: 'Clothing',
    title: 'Designer Handbag',
    description: 'Authentic leather handbag, small scuff on one corner but otherwise excellent condition.',
  },
  // Electronics
  {
    category: 'Electronics',
    title: 'Old iPad (2017)',
    description: 'Works fine, battery holds about 60% charge. Includes charger. Small crack in the corner of the screen.',
  },
  {
    category: 'Electronics',
    title: 'Desktop Computer Tower',
    description: 'Older desktop, good for basic tasks or as a parts machine. No monitor included.',
  },
  {
    category: 'Electronics',
    title: 'Bluetooth Speaker',
    description: 'JBL speaker, works great, just upgrading to a newer one. Includes charging cable.',
  },
  {
    category: 'Electronics',
    title: 'Printer/Scanner Combo',
    description: 'HP all-in-one printer, works but ink is low. Great for someone who just needs occasional prints.',
  },
  // Books
  {
    category: 'Books',
    title: 'Harry Potter Box Set',
    description: 'Complete 7-book paperback set, some wear on the covers but all pages intact.',
  },
  {
    category: 'Books',
    title: 'Cookbook Collection',
    description: '10+ cookbooks ranging from baking to Italian cuisine. Great condition.',
  },
  {
    category: 'Books',
    title: 'College Textbooks (Biology/Chem)',
    description: 'A stack of intro science textbooks, a few years old but content is still relevant.',
  },
  {
    category: 'Books',
    title: 'Kids Picture Books (Box of 20)',
    description: 'Assorted picture books for toddlers and early readers, great condition.',
  },
  // Other
  {
    category: 'Other',
    title: 'Artificial Christmas Tree (6ft)',
    description: 'Pre-lit artificial tree, missing the original box but works great. Local pickup only.',
  },
  {
    category: 'Other',
    title: 'Exercise Bike',
    description: 'Stationary bike, needs a new seat cushion but otherwise works well.',
  },
  {
    category: 'Other',
    title: 'Assorted Kitchenware Box',
    description: 'Pots, pans, and utensils - moving and can’t take it all with me.',
  },
  {
    category: 'Other',
    title: 'Board Game Bundle',
    description: '8 family board games, all pieces accounted for as far as we know!',
  },
];

const REVIEW_COMMENTS = {
  5: [
    'Super easy pickup, exactly as described. Thank you!',
    'Great communication and the item was in even better shape than pictured.',
    'Wonderful experience, would gladly do business with them again.',
  ],
  4: [
    'Good experience overall, minor scheduling hiccup but worth it.',
    'Item was as described, pickup was quick and easy.',
  ],
  3: [
    'Item was okay, a bit more worn than the photos suggested.',
    'Fine transaction, took a couple messages to coordinate pickup.',
  ],
};

async function createFakeUsers() {
  const users = [];

  for (const person of FAKE_USERS) {
    const email = `${person.firstName}.${person.lastName}.seed@example.com`.toLowerCase();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: randomPassword(),
      email_confirm: true,
    });

    if (authError) {
      throw new Error(`Failed to create auth user for ${email}: ${authError.message}`);
    }

    const userId = authData.user.id;
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${person.firstName}+${person.lastName}`
    )}`;

    const { error: profileError } = await supabase.from('users').insert({
      id: userId,
      name: `${person.firstName} ${person.lastName}`,
      age: person.age,
      city: person.city,
      avatar_url: avatarUrl,
    });

    if (profileError) {
      throw new Error(`Failed to create profile for ${email}: ${profileError.message}`);
    }

    users.push({ id: userId, name: `${person.firstName} ${person.lastName}` });
    console.log(`  created user: ${person.firstName} ${person.lastName}`);
  }

  return users;
}

async function createFakeListings(users) {
  const listings = [];

  for (let i = 0; i < FAKE_LISTINGS.length; i++) {
    const template = FAKE_LISTINGS[i];
    const owner = pick(users);

    const { data, error } = await supabase
      .from('listings')
      .insert({
        user_id: owner.id,
        title: template.title,
        description: template.description,
        category: template.category,
        status: 'available',
        latitude: jitteredCoordinate(ORLANDO.lat, 0.1),
        longitude: jitteredCoordinate(ORLANDO.lng, 0.1),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create listing "${template.title}": ${error.message}`);
    }

    listings.push({ ...data, ownerId: owner.id });
    console.log(`  created listing: ${template.title} (${template.category})`);
  }

  return listings;
}

async function createFakePhotos(listings) {
  let photoCount = 0;

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    const numPhotos = 1 + (i % 3); // 1, 2, or 3 photos per listing

    const photoInserts = Array.from({ length: numPhotos }, (_, photoIndex) => ({
      listing_id: listing.id,
      photo_url: `https://picsum.photos/seed/freefinder-${i}-${photoIndex}/800/600`,
      order: photoIndex,
    }));

    const { error } = await supabase.from('listing_photos').insert(photoInserts);

    if (error) {
      throw new Error(`Failed to create photos for listing ${listing.id}: ${error.message}`);
    }

    photoCount += photoInserts.length;
  }

  return photoCount;
}

async function createFakeReviews(users, listings) {
  const seen = new Set();
  const reviewRows = [];

  let attempts = 0;
  while (reviewRows.length < 10 && attempts < 500) {
    attempts += 1;
    const user = pick(users);
    const listing = pick(listings);
    const key = `${user.id}:${listing.id}`;

    if (user.id === listing.ownerId) continue; // skip reviewing your own listing
    if (seen.has(key)) continue;

    seen.add(key);
    const rating = pick([3, 4, 4, 5, 5, 5]); // skewed positive, matches realistic sentiment
    const comment = pick(REVIEW_COMMENTS[rating] || REVIEW_COMMENTS[4]);

    reviewRows.push({
      user_id: user.id,
      listing_id: listing.id,
      rating,
      comment,
    });
  }

  const { error } = await supabase.from('reviews').insert(reviewRows);

  if (error) {
    throw new Error(`Failed to create reviews: ${error.message}`);
  }

  return reviewRows.length;
}

async function main() {
  console.log('Seeding fake users...');
  const users = await createFakeUsers();

  console.log('Seeding fake listings...');
  const listings = await createFakeListings(users);

  console.log('Seeding listing photos...');
  const photoCount = await createFakePhotos(listings);

  console.log('Seeding reviews...');
  const reviewCount = await createFakeReviews(users, listings);

  console.log('\nDone!');
  console.log(`  users:    ${users.length}`);
  console.log(`  listings: ${listings.length}`);
  console.log(`  photos:   ${photoCount}`);
  console.log(`  reviews:  ${reviewCount}`);
}

main().catch((error) => {
  console.error('\nSeed failed:', error.message);
  process.exit(1);
});
