# Event Seeding Instructions

## Overview
This document explains how to seed your MongoDB database with default events.

## Issues Fixed

### 1. MongoDB Error Handling
- Added comprehensive error logging to identify exact MongoDB rejection reasons
- Improved error messages with specific error codes and types
- Added validation checks before database operations
- Fixed response format to use JSON consistently across all routes

### 2. Event Creation Route Improvements
- Added detailed logging for debugging
- Improved field validation and trimming
- Better error handling for MongoDB connection issues
- Added collection initialization checks

### 3. Default Events Seed Script
- Created `seedEvents.js` to populate the database with 15 diverse events
- Events cover all event types: Cleanup, Plantation, Donation, Education, Healthcare
- Events are scheduled for future dates (5-20 days from now)

## How to Seed Default Events

### Prerequisites
1. Make sure you have a `.env` file in the `social-events-server` directory
2. Ensure `MONGODB_URI` is set in your `.env` file
3. Make sure your MongoDB connection is working

### Steps

1. **Navigate to the server directory:**
   ```bash
   cd social-events-server
   ```

2. **Run the seed script:**
   ```bash
   npm run seed
   ```
   
   Or directly:
   ```bash
   node seedEvents.js
   ```

3. **Verify the events:**
   - The script will output the number of events inserted
   - Check your MongoDB database to see the events
   - Visit your website's "Upcoming Events" page to see them displayed

### What the Seed Script Does

- Connects to MongoDB using your `MONGODB_URI`
- Clears existing events (if any)
- Inserts 15 default events with:
  - Diverse event types
  - Realistic descriptions
  - Future event dates
  - Sample thumbnail URLs
  - Various locations in Bangladesh

### Default Events Included

1. Community Beach Cleanup Drive
2. Tree Plantation Campaign in Dhaka
3. Winter Clothes Donation Drive
4. Free Computer Literacy Workshop
5. Free Health Checkup Camp
6. Blood Donation Drive
7. Street Children Education Support
8. Food Distribution for Homeless
9. Park Cleanup and Beautification
10. Mangrove Plantation in Sundarbans
11. Digital Skills Training for Women
12. River Cleanup Initiative
13. School Supplies Donation
14. Mental Health Awareness Session
15. Community Garden Project

## Troubleshooting

### If seeding fails:

1. **Check MongoDB Connection:**
   - Verify your `MONGODB_URI` in `.env` file
   - Test connection using MongoDB Compass or similar tool

2. **Check Error Messages:**
   - The script will output detailed error messages
   - Common issues:
     - Invalid MongoDB URI
     - Network connectivity issues
     - Database permissions

3. **Verify Environment Variables:**
   ```bash
   # Make sure .env file exists and contains:
   MONGODB_URI=your_mongodb_connection_string
   ```

## Testing Event Creation

After seeding, you can test creating new events:

1. Start your server:
   ```bash
   npm start
   # or
   npm run dev
   ```

2. Use the Create Event form on your website
3. Check server logs for detailed error messages if creation fails
4. Verify the event appears in MongoDB and on your website

## Notes

- The seed script will clear existing events before inserting new ones
- Event dates are calculated dynamically (relative to when you run the script)
- All events are created by "admin@socialserve.com" as the default creator
- You can modify `seedEvents.js` to add more events or change existing ones

