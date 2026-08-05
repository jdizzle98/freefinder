# FreeFinder Database Schema

## Tables

### 1. users
Stores user profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | Primary Key, References auth.users.id | User ID (matches Supabase auth user ID) |
| name | TEXT | NOT NULL | User's full name |
| age | INTEGER | NULLABLE | User's age |
| city | TEXT | NULLABLE | User's city |
| avatar_url | TEXT | NULLABLE | URL to user's avatar image |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Timestamp when user was created |

### 2. listings
Stores information about free items being offered.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | Primary Key | Unique identifier for the listing |
| user_id | UUID | NOT NULL, References users.id | ID of the user who posted the listing |
| title | TEXT | NOT NULL | Title of the item |
| description | TEXT | NOT NULL | Detailed description of the item |
| category | TEXT | NOT NULL | Category of the item (e.g., furniture, clothing) |
| status | TEXT | NOT NULL, DEFAULT 'available' | Status of the item ('available' or 'claimed') |
| latitude | DOUBLE PRECISION | NULLABLE | Latitude coordinate for mapping |
| longitude | DOUBLE PRECISION | NULLABLE | Longitude coordinate for mapping |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Timestamp when listing was created |

### 3. listing_photos
Stores photos associated with listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | Primary Key | Unique identifier for the photo |
| listing_id | UUID | NOT NULL, References listings.id | ID of the listing this photo belongs to |
| photo_url | TEXT | NOT NULL | URL of the photo (stored in Supabase Storage) |
| \`order\` | INTEGER | NOT NULL | Order of the photo in the gallery |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Timestamp when photo was uploaded |

### 4. reviews
Stores reviews left by users on listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | Primary Key | Unique identifier for the review |
| user_id | UUID | NOT NULL, References users.id | ID of the user who wrote the review |
| listing_id | UUID | NOT NULL, References listings.id | ID of the reviewed listing |
| rating | INTEGER | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | Star rating (1-5) |
| comment | TEXT | NULLABLE | Written comment from the reviewer |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Timestamp when review was created |

### 5. conversations
Represents a conversation between two users about a specific listing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | Primary Key | Unique identifier for the conversation |
| listing_id | UUID | NOT NULL, References listings.id | ID of the listing the conversation is about |
| poster_id | UUID | NOT NULL, References users.id | ID of the user who posted the listing |
| inquirer_id | UUID | NOT NULL, References users.id | ID of the user who inquired about the listing |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Timestamp when conversation was created |

### 6. messages
Individual messages within a conversation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | Primary Key | Unique identifier for the message |
| conversation_id | UUID | NOT NULL, References conversations.id | ID of the conversation this message belongs to |
| sender_id | UUID | NOT NULL, References users.id | ID of the user who sent the message |
| content | TEXT | NOT NULL | The message content |
| read | BOOLEAN | NOT NULL, DEFAULT false | Whether the message has been read by the recipient |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Timestamp when message was sent |

## Storage Buckets

### 1. listing-photos
Stores photos uploaded for listings.

### 2. profile-photos
Stores profile pictures uploaded by users.

## Security Policies (Row Level Security)

### users table
- Users can only update their own profile
- Anyone can view profiles (for public profiles)

### listings table
- Anyone can view available listings
- Only the listing owner can update/delete their listing
- Only the listing owner can change status to 'claimed'

### listing_photos table
- Anyone can view photos of available listings
- Only the listing owner can upload/delete photos

### reviews table
- Anyone can view reviews
- Users can only insert/update/delete their own reviews

### conversations table
- Users can only see conversations they are part of
- Users can create new conversations (when messaging a poster)

### messages table
- Users can only see messages in conversations they are part of
- Users can only insert messages in conversations they are part of
- Users can update the 'read' status of messages they receive

## Indexes

- listings(status, created_at) - for efficient querying of available listings
- listings(user_id) - for fetching a user's listings
- listing_photos(listing_id) - for fetching photos for a listing
- reviews(listing_id) - for fetching reviews for a listing
- conversations(poster_id, inquirer_id) - for finding conversations between users
- messages(conversation_id) - for fetching messages in a conversation
- messages(sender_id) - for fetching messages sent by a user
