-- Initialize database with proper settings
CREATE DATABASE IF NOT EXISTS urban_it_ledger;

-- Set timezone
SET timezone = 'UTC';

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";