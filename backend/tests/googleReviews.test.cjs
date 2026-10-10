const assert = require('node:assert/strict');
const { test, after } = require('node:test');

// Isolated credentials: these tests never use .env values or call Google/Supabase.
Object.assign(process.env, {
  NODE_ENV: 'test', SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SECRET_KEY: 'test-secret-key-with-at-least-twenty-characters',
  SUPABASE_JWKS_URL: 'https://test.supabase.co/auth/v1/.well-known/jwks.json',
  FRONTEND_URL: 'http://localhost:3000', REVALIDATE_SECRET: 'test-revalidate-secret-at-least-32-characters',
  GOOGLE_BUSINESS_CLIENT_ID: 'test-client', GOOGLE_BUSINESS_CLIENT_SECRET: 'test-secret',
  GOOGLE_BUSINESS_REFRESH_TOKEN: 'test-refresh-token', GOOGLE_BUSINESS_LOCATION: 'accounts/123/locations/456',
  GOOGLE_BUSINESS_MAPS_URL: 'https://maps.app.goo.gl/test',
});
const { env } = require('../src/config/env.ts');
const { db } = require('../src/lib/supabase.ts');
const service = require('../src/services/googleReviews.ts');
const originalFetch = global.fetch;
const originalFrom = db.from;
let selectedIds = [];
let calls = [];
let handler;
db.from = (table) => {
  assert.equal(table, 'google_review_selections');
  return { select: () => ({ eq: (_column, location) => {
    assert.equal(location, 'accounts/123/locations/456');
    return { maybeSingle: async () => ({ data: { review_ids: selectedIds }, error: null }) };
  } }) };
};
global.fetch = async (url, options) => {
  calls.push(String(url));
  if (String(url) === 'https://oauth2.googleapis.com/token') {
    assert.equal(options.body.get('grant_type'), 'refresh_token');
    return Response.json({ access_token: 'test-access', expires_in: 3600 });
  }
  assert.equal(options.headers.Authorization, 'Bearer test-access');
  return handler(String(url));
};
after(() => { global.fetch = originalFetch; db.from = originalFrom; service.clearFeaturedGoogleReviews(); });
const review = (id, comment = 'A comfortable trip.') => ({ reviewId: id, reviewer: { displayName: 'Test customer' }, starRating: 'FOUR', comment, createTime: '2026-10-01T00:00:00Z' });

test('Google review fetching and curation', async (t) => {
  await t.test('missing configuration makes public reviews optional', async () => {
    const previous = env.GOOGLE_BUSINESS_REFRESH_TOKEN;
    env.GOOGLE_BUSINESS_REFRESH_TOKEN = '';
    assert.equal(service.googleReviewConfiguration().configured, false);
    assert.deepEqual(await service.featuredGoogleReviews(), []);
    assert.equal(calls.length, 0);
    env.GOOGLE_BUSINESS_REFRESH_TOKEN = previous;
  });
  await t.test('pagination forwards an encoded token and preserves text and rating', async () => {
    handler = (url) => {
      const query = new URL(url).searchParams;
      assert.equal(query.get('pageSize'), '50');
      assert.equal(query.get('pageToken'), 'next+/=token');
      return Response.json({ reviews: [review('r1')], nextPageToken: 'page2', totalReviewCount: 72 });
    };
    const page = await service.listGoogleReviews('next+/=token');
    assert.equal(page.items[0].rating, 4);
    assert.equal(page.items[0].quote, 'A comfortable trip.');
    assert.equal(page.totalReviewCount, 72);
    assert.equal(page.nextPageToken, 'page2');
  });
  await t.test('selected order is retained and deleted or rating-only reviews are omitted', async () => {
    selectedIds = ['second', 'deleted', 'first', 'rating-only'];
    calls = [];
    handler = (url) => {
      const id = url.split('/').pop();
      return id === 'deleted' ? Response.json({}, { status: 404 }) : Response.json(review(id, id === 'rating-only' ? '' : id));
    };
    const featured = await service.featuredGoogleReviews();
    assert.deepEqual(featured.map((item) => item.id), ['google:second', 'google:first']);
    assert.equal(featured[0].sourceUrl, env.GOOGLE_BUSINESS_MAPS_URL);
    const count = calls.length;
    await service.featuredGoogleReviews();
    assert.equal(calls.length, count, 'repeated requests use the short-lived cache');
    assert.equal(calls.filter((url) => url.includes('oauth2')).length, 0, 'valid OAuth token is reused');
  });
  await t.test('cache invalidation applies a changed selection immediately', async () => {
    selectedIds = ['new-selection'];
    service.clearFeaturedGoogleReviews();
    const featured = await service.featuredGoogleReviews();
    assert.deepEqual(featured.map((item) => item.id), ['google:new-selection']);
  });
  await t.test('an old in-flight fetch cannot repopulate the cache after a save', async () => {
    service.clearFeaturedGoogleReviews();
    selectedIds = ['old-review'];
    let release;
    const pending = new Promise((resolve) => { release = resolve; });
    handler = async (url) => { await pending; return Response.json(review(url.split('/').pop())); };
    const oldRequest = service.featuredGoogleReviews();
    await new Promise((resolve) => setImmediate(resolve));
    service.clearFeaturedGoogleReviews();
    selectedIds = ['current-review'];
    handler = (url) => Response.json(review(url.split('/').pop()));
    const current = await service.featuredGoogleReviews();
    release();
    await oldRequest;
    assert.deepEqual(current.map((item) => item.id), ['google:current-review']);
    assert.deepEqual((await service.featuredGoogleReviews()).map((item) => item.id), ['google:current-review']);
  });
  await t.test('forbidden access gives actionable feedback without provider details', async () => {
    handler = () => Response.json({ error: { message: 'provider-secret-details' } }, { status: 403 });
    await assert.rejects(service.listGoogleReviews(), (error) => error.status === 502 && error.message.includes('API approval') && !error.message.includes('provider-secret-details'));
  });
  await t.test('unsafe IDs and mismatched review responses are rejected', async () => {
    assert.equal(service.reviewIdSchema.safeParse('../other-location').success, false);
    handler = () => Response.json(review('another-id'));
    await assert.rejects(service.getGoogleReview('requested-id'), /unexpected review response/);
  });
});
