const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const University = require('../models/University');
const Application = require('../models/Application');

dotenv.config();

class DatabaseMigration {
  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');
  }

  // Migration 1: Add new fields to existing users
  async migrateUserFields() {
    console.log('\n📝 Migration: Adding new fields to users...');
    
    try {
      const result = await User.updateMany(
        { preferredCountries: { $exists: false } },
        {
          $set: {
            preferredCountries: [],
            preferredCourses: [],
            studyLevel: null,
            budget: { min: null, max: null, currency: 'USD' }
          }
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} users`);
    } catch (error) {
      console.error('❌ Migration failed:', error);
    }
  }

  // Migration 2: Update university schema
  async migrateUniversitySchema() {
    console.log('\n📝 Migration: Updating university schema...');
    
    try {
      const result = await University.updateMany(
        { viewCount: { $exists: false } },
        {
          $set: {
            viewCount: 0,
            applicationCount: 0,
            reviewCount: 0,
            averageRating: 0,
            isVerified: false,
            isFeatured: false
          }
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} universities`);
    } catch (error) {
      console.error('❌ Migration failed:', error);
    }
  }

  // Migration 3: Add slugs to universities
  async generateUniversitySlugs() {
    console.log('\n📝 Migration: Generating university slugs