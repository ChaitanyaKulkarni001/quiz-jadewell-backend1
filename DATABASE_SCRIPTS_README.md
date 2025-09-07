# Database Management Scripts

This directory contains scripts for managing the TCM Quiz application database.

## Available Scripts

### 1. `db_manager.js` - Master Database Manager
A comprehensive script that handles all database operations.

**Usage:**
```bash
# Delete all tables
node db_manager.js delete

# Create all tables
node db_manager.js create

# Seed practitioners data
node db_manager.js seed

# Full reset (delete, create, and seed)
node db_manager.js reset

# List all practitioners
node db_manager.js list
```

### 2. `delete_tables.js` - Delete All Tables
Removes all database tables.

**Usage:**
```bash
node delete_tables.js
```

### 3. `create_tables.js` - Create All Tables
Creates all required database tables with proper schema.

**Usage:**
```bash
node create_tables.js
```

### 4. `seed_practitioners.js` - Seed Practitioners Data
Populates the practitioners table with demo data.

**Usage:**
```bash
node seed_practitioners.js
```

## Database Schema

### Tables Created:

1. **tcm_submissions** - Stores TCM quiz submissions
2. **users** - User accounts
3. **herbal_formulas** - Herbal formula recommendations
4. **patients** - Patient information
5. **practitioners** - TCM practitioners with specialties
6. **tcm_appointments** - Appointment bookings

### Practitioners Table Structure:
- `id` - Primary key
- `name` - Practitioner name
- `title` - Professional title
- `specialties` - JSON array of specialties
- `experience` - Years of experience
- `rating` - Average rating (decimal)
- `reviews_count` - Number of reviews
- `bio` - Professional biography
- `availability` - Current availability
- `image_url` - Profile image URL
- `created_at` - Creation timestamp

## Setup Instructions

1. **Initial Setup:**
   ```bash
   node db_manager.js reset
   ```

2. **Verify Setup:**
   ```bash
   node db_manager.js list
   ```

3. **Start Server:**
   ```bash
   node server.js
   ```

4. **Test API:**
   ```bash
   curl http://localhost:5000/api/practitioners
   ```

## API Endpoints

- `GET /api/practitioners` - Fetch all practitioners
- `POST /api/appointment/create-full` - Create new appointment
- `GET /api/appointment/:id` - Get appointment details

## Troubleshooting

If you encounter issues:

1. **Database locked:** Make sure no other processes are using the database
2. **Tables not found:** Run `node db_manager.js reset`
3. **API errors:** Check server logs and ensure database is properly seeded

## Future Enhancements

- Add more practitioner data
- Implement appointment scheduling logic
- Add user authentication
- Add payment processing integration
