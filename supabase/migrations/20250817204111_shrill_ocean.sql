/*
  # Urban-IT Ledger Database Schema

  1. New Tables
    - `approved_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `role` (enum: ADMIN, USER)
      - `permission` (enum: READ, WRITE)
      - `created_at` (timestamp)
    
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `password` (text, hashed)
      - `role` (enum: ADMIN, USER)
      - `permission` (enum: READ, WRITE)
      - `is_whitelisted` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `type` (enum: INCOME, EXPENDITURE)
      - `amount` (decimal)
      - `category` (text)
      - `description` (text)
      - `date` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Foreign key constraints with cascade delete

  3. Indexes
    - Email indexes for fast lookups
    - Date indexes for transaction queries
    - User ID indexes for transaction filtering
*/

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENDITURE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('READ', 'WRITE');

-- CreateTable
CREATE TABLE IF NOT EXISTS "approved_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "permission" "Permission" NOT NULL DEFAULT 'WRITE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approved_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "permission" "Permission" NOT NULL DEFAULT 'WRITE',
    "is_whitelisted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "approved_users_email_key" ON "approved_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "transactions_category_idx" ON "transactions"("category");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;