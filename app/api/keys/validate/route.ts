import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// Check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// POST - Validate an API key
export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { valid: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    // Check if the API key exists in the database
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, type')
      .eq('key', apiKey.trim())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No matching record found
        return NextResponse.json({ valid: false, error: 'Invalid API key' });
      }
      console.error('Supabase error:', error);
      return NextResponse.json(
        { valid: false, error: 'Validation failed' },
        { status: 500 }
      );
    }

    // API key is valid
    return NextResponse.json({
      valid: true,
      keyInfo: {
        id: data.id,
        name: data.name,
        type: data.type,
      },
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

