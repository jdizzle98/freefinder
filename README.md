# FreeFinder

A mobile-first web application that connects people who want to give away free items with those looking to find them nearby.

## Features

- **Geolocation Map View**: See free items near you on an interactive map
- **Post Free Items**: Users can post items they want to give away
- **Social Features**: Review and message other users
- **User Profiles**: Showcase your activity and reputation
- **Real-time Messaging**: Communicate with other users instantly

## Tech Stack

- **Frontend**: Next.js 13+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL JS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 16+ or later
- npm or yarn
- Supabase account
- Mapbox account (for access token)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd freefinder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
   ```

4. Set up the Supabase database:
   - Create a new Supabase project
   - Run the SQL schema found in `docs/database_schema.md`
   - Create storage buckets: `listing-photos` and `profile-photos`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app - Next.js app router pages and layouts
/components - Reusable React components
/context - React context providers (Auth)
/docs - Documentation files
/lib - Utility files (Supabase client)
/public - Static assets
```

## Key Components

- **MapContainer**: Displays the interactive map with listing pins
- **ListingCard**: Shows a summary of a free item listing
- **Header/Navbar**: Navigation bar with user authentication controls
- **PostFAB**: Floating action button for posting new items
- **FilterSidebar**: Controls for filtering listings by distance and category

## Features in Detail

### Home Page
- Shows a map of free items near the user's location
- Toggle between map and list view
- Filter by distance and category
- Floating action button to post new items

### Posting an Item
- Authenticated users can create listings with:
  - Title and description
  - Category selection
  - Up to 5 photos
  - Location (via map or automatic geolocation)
- Listings default to "available" status

### Interactions
- **Review**: Users can leave star ratings and written comments
- **Message**: Users can initiate direct conversations with posters
- **Profile**: Users can view their posted items and reviews

## Future Enhancements

- Push notifications for new messages and nearby listings
- Watchlist feature for saved searches
- Report/flag listings for abuse
- Category icons for visual filtering
- Social sharing of listings

## License

MIT
