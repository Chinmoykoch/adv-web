This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Google reviews in the content studio

`/adv-admin-panel/testimonials` includes a Google Business Profile review selector alongside
the existing manually managed testimonials. Once connected, load reviews, browse additional
pages, search/filter loaded reviews, select up to 12 written reviews, arrange them, and save.
Saved Google selections appear first in the website carousel. Rating-only reviews can be
browsed in the studio but cannot be selected for written testimonials.

### Activate the connection

1. As the AdventureCarz profile owner or manager, create a Google Cloud project and request
   **Basic API Access** using Google's [Business Profile API prerequisites](https://developers.google.com/my-business/content/prereqs).
   Google currently requires a verified, active profile for at least 60 days and the business
   website listed on the profile. The application uses the Cloud **project number**.
2. After approval, enable the **Google My Business API** (v4 reviews). For initial discovery,
   also enable **My Business Account Management API** and **My Business Business Information API**.
3. Configure the OAuth consent screen and create your own **Web application** OAuth client.
   Authorize the owner/manager account for `https://www.googleapis.com/auth/business.manage`
   with offline access to obtain a refresh token. Follow Google's [OAuth server guide](https://developers.google.com/identity/protocols/oauth2/web-server#offline).
   For a one-time developer setup, the [OAuth Playground](https://developers.google.com/oauthplayground/)
   can use your own client: add `https://developers.google.com/oauthplayground` as an authorized
   redirect URI, enable **Use your own OAuth credentials**, authorize the scope, and exchange
   the authorization code. Keep the refresh token on the backend only. External OAuth apps
   in Testing can have refresh tokens expire after seven days; configure the consent app for
   ongoing production use and complete any required verification.
4. Using the authorized account, discover the account with
   `GET https://mybusinessaccountmanagement.googleapis.com/v1/accounts`, then the location with
   `GET https://mybusinessbusinessinformation.googleapis.com/v1/accounts/ACCOUNT_ID/locations?readMask=name,title`.
   Follow pagination if necessary and choose AdventureCarz. Combine the numeric identifiers
   as `accounts/ACCOUNT_ID/locations/LOCATION_ID`; a Google Maps Place ID is different.
5. Apply `backend/supabase/migrations/20261009000000_google_review_selections.sql` to the backend's
   Supabase project after the existing migrations. This adds a private selection table with
   row-level security. It stores IDs and ordering, never review content.
6. Set these **backend** variables, also documented in `backend/.env.example`:

   ```env
   GOOGLE_BUSINESS_CLIENT_ID=your-own-client-id
   GOOGLE_BUSINESS_CLIENT_SECRET=your-client-secret
   GOOGLE_BUSINESS_REFRESH_TOKEN=your-owner-or-manager-refresh-token
   GOOGLE_BUSINESS_LOCATION=accounts/123456789/locations/987654321
   GOOGLE_BUSINESS_MAPS_URL=https://maps.app.goo.gl/your-business-listing
   ```

   Put real values in `backend/.env` locally and in the backend host's secret settings in
   production. Never put OAuth secrets or refresh tokens in `NEXT_PUBLIC_*` variables or Git.
7. Restart/deploy the backend and updated frontend. In Testimonials, click **Check again**,
   **Load Google reviews**, then select, order, and **Save selection**. Check the home page and
   Maps attribution. The first successful load verifies access; configuration alone does not
   guarantee Google approval.

### Refresh and availability

Google's [reviews list API](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list)
returns up to 50 reviews per page. **Load more reviews** exposes subsequent pages, including
older and lower-rated reviews. Search and rating filters apply to loaded pages.

Review text is read from Google, cannot be edited in the studio, and never enters permanent
testimonial revision history. Selected content has a five-minute backend memory cache that
expires even without traffic; loaded studio content expires after 15 minutes. The home page
uses a `no-store` server fetch for Google content, so it renders at request time while manual
content retains its existing cache. This avoids indefinite copies in Next's persistent cache.
Google outages or removed reviews omit unavailable Google reviews while keeping manual
testimonials. **Refresh website reviews** clears the backend cache; normally the next visit
after five minutes refreshes selected content.

The integration uses your own approved project and owner/manager OAuth authorization.
An Analytics Measurement ID cannot authorize reviews. Google's [content storage requirements](https://developers.google.com/my-business/content/policies#content_storage)
limit storage of review content; only selection IDs are stored permanently. There is no scraping,
automatic permanent import of all reviews, review editing, or reply posting.

Backend behavior checks: `cd backend` then `node --require tsx/cjs --test tests/googleReviews.test.cjs`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
