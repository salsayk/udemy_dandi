import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Ensure URL has https:// prefix
const formattedUrl = supabaseUrl?.startsWith('http') 
  ? supabaseUrl 
  : `https://${supabaseUrl}`;

export const supabase = createClient(formattedUrl || '', supabaseAnonKey || '');

// Type definitions for the api_keys table
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: 'dev' | 'prod';
  usage: number;
  created_at: string;
}

export interface CreateApiKeyInput {
  name: string;
  key: string;
  type: 'dev' | 'prod';
}

export interface UpdateApiKeyInput {
  name?: string;
  type?: 'dev' | 'prod';
}

