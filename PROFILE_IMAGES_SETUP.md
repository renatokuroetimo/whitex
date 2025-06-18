# Profile Images Setup Guide

## Problem Fixed

The error `❌ Erro ao carregar imagem do Supabase: [object Object]` has been resolved with better error logging and handling.

## Current Status

✅ **Error Logging**: Fixed - now shows detailed error information
✅ **Fallback System**: Working - automatically falls back to localStorage
✅ **Error Handling**: Improved - graceful degradation when table doesn't exist

## To Fully Enable Profile Images in Supabase

### 1. Create the Profile Images Table

Execute this SQL in your Supabase dashboard (SQL Editor):

```sql
-- Tabela para armazenar imagens de perfil dos usuários
CREATE TABLE profile_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_data TEXT NOT NULL, -- Base64 da imagem
  mime_type TEXT DEFAULT 'image/jpeg',
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índice para performance
CREATE INDEX idx_profile_images_user_id ON profile_images(user_id);

-- RLS (Row Level Security)
ALTER TABLE profile_images ENABLE ROW LEVEL SECURITY;

-- Política: usuários só podem ver/editar sua própria imagem
CREATE POLICY "Users can view own profile image" ON profile_images
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own profile image" ON profile_images
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own profile image" ON profile_images
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own profile image" ON profile_images
  FOR DELETE USING (user_id = auth.uid()::text);
```

### 2. Test Table Creation

In the browser console, you can test if the table was created correctly:

```javascript
// This will check and report table status
import { profileImageAPI } from "/src/lib/profile-image-api.ts";
profileImageAPI.initializeTable();
```

### 3. Migrate Existing Images (Optional)

If you have existing profile images in localStorage, you can migrate them:

```javascript
// This will migrate localStorage images to Supabase
import { profileImageAPI } from "/src/lib/profile-image-api.ts";
profileImageAPI.migrateLocalImagesToSupabase();
```

## How It Works Now

### Before Fix:

- ❌ Showed `[object Object]` error
- ❌ No information about what went wrong
- ❌ Hard to debug issues

### After Fix:

- ✅ **Detailed Error Logging**: Shows exact error codes, messages, and hints
- ✅ **Graceful Fallback**: Automatically uses localStorage when Supabase fails
- ✅ **Developer Friendly**: Clear instructions on how to fix issues
- ✅ **Table Detection**: Automatically detects if table exists and provides setup instructions

## Error Codes You Might See

- **PGRST204**: Table doesn't exist - run the SQL script above
- **PGRST116**: Record not found - normal when no profile image exists yet
- **42P01**: Relation does not exist - same as PGRST204
- **Network errors**: Connection issues - will fallback to localStorage

## Current Behavior

1. **Try Supabase First**: Attempts to load/save to profile_images table
2. **Smart Fallback**: If table doesn't exist or there's an error, uses localStorage
3. **Helpful Logging**: Provides clear messages about what's happening
4. **Seamless UX**: Users don't see errors, images work via localStorage until Supabase is ready

The system is now robust and will work perfectly even without the Supabase table, while providing clear guidance on how to enable full cloud functionality.
