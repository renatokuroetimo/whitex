-- URGENT FIX: Add missing columns to indicators table
-- Execute this immediately in Supabase SQL Editor

-- Check current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'indicators' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns one by one (safe for existing data)
DO $$
BEGIN
    -- Add category_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='category_id') THEN
        ALTER TABLE indicators ADD COLUMN category_id TEXT;
        RAISE NOTICE 'Added category_id column';
    ELSE
        RAISE NOTICE 'category_id column already exists';
    END IF;

    -- Add subcategory_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='subcategory_id') THEN
        ALTER TABLE indicators ADD COLUMN subcategory_id TEXT;
        RAISE NOTICE 'Added subcategory_id column';
    ELSE
        RAISE NOTICE 'subcategory_id column already exists';
    END IF;

    -- Add parameter column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='parameter') THEN
        ALTER TABLE indicators ADD COLUMN parameter TEXT;
        RAISE NOTICE 'Added parameter column';
    ELSE
        RAISE NOTICE 'parameter column already exists';
    END IF;

    -- Add unit_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='unit_id') THEN
        ALTER TABLE indicators ADD COLUMN unit_id TEXT;
        RAISE NOTICE 'Added unit_id column';
    ELSE
        RAISE NOTICE 'unit_id column already exists';
    END IF;

    -- Add unit_symbol column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='unit_symbol') THEN
        ALTER TABLE indicators ADD COLUMN unit_symbol TEXT DEFAULT 'un';
        RAISE NOTICE 'Added unit_symbol column';
    ELSE
        RAISE NOTICE 'unit_symbol column already exists';
    END IF;

    -- Add is_mandatory column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='is_mandatory') THEN
        ALTER TABLE indicators ADD COLUMN is_mandatory BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_mandatory column';
    ELSE
        RAISE NOTICE 'is_mandatory column already exists';
    END IF;

    -- Add doctor_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='doctor_id') THEN
        ALTER TABLE indicators ADD COLUMN doctor_id TEXT;
        RAISE NOTICE 'Added doctor_id column';
    ELSE
        RAISE NOTICE 'doctor_id column already exists';
    END IF;

    -- Add created_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='created_at') THEN
        ALTER TABLE indicators ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    ELSE
        RAISE NOTICE 'created_at column already exists';
    END IF;

    -- Add updated_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='updated_at') THEN
        ALTER TABLE indicators ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    ELSE
        RAISE NOTICE 'updated_at column already exists';
    END IF;

    RAISE NOTICE 'Indicators table schema fix completed!';
END $$;

-- Verify the final structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'indicators' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test insert (optional - remove this line if you don't want to test)
-- INSERT INTO indicators (id, name, category_id, subcategory_id, parameter, unit_id, unit_symbol, is_mandatory, doctor_id, created_at)
-- VALUES ('test123', 'Test Indicator', 'cat1', 'sub1', 'Test Parameter', 'unit_test', 'test', false, 'test_doctor', NOW());
