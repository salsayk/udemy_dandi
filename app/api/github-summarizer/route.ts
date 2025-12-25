import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { generateSummary, GitHubRepoInfo } from './chain';

// Check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// Validate API key from request headers
async function validateApiKey(request: Request): Promise<{ valid: boolean; error?: string }> {
  // const authHeader = request.headers.get('Authorization');
  
  // if (!authHeader) {
  //   return { valid: false, error: 'Missing Authorization header' };
  // }

  // Extract the API key from Bearer token format
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
     return { valid: false, error: 'Invalid API key format' };
  }

  // Check if the API key exists in the database
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, type')
    .eq('key', apiKey)
    .single();

  if (error || !data) {
    return { valid: false, error: 'Invalid API key' };
  }

  return { valid: true };
}

// GET - GitHub Summarizer endpoint
export async function GET(request: Request) {
  try {
    // Check configuration first
    if (!isSupabaseConfigured()) {
      console.error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
      return NextResponse.json(
        { error: 'Database not configured. Please check your environment variables.' },
        { status: 503 }
      );
    }

    // Validate API key
    const validation = await validateApiKey(request);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      message: 'GitHub Summarizer API',
      status: 'authenticated'
    });
  } catch (error) {
    console.error('Server error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Summarize GitHub repository
export async function POST(request: Request) {
  try {
    // Check configuration first
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured. Please check your environment variables.' },
        { status: 503 }
      );
    }

    // Validate API key
    const validation = await validateApiKey(request);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.githubUrl) {
      return NextResponse.json(
        { error: 'Missing required field: githubUrl' },
        { status: 400 }
      );
    }

    // Parse GitHub URL to extract owner and repo
    const githubUrlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = body.githubUrl.match(githubUrlPattern);
    
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid GitHub repository URL. Format: https://github.com/owner/repo' },
        { status: 400 }
      );
    }

    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, ''); // Remove .git suffix if present

    // Fetch repository information from GitHub API
    const [repoInfo, readmeContent] = await Promise.all([
      fetchRepoInfo(owner, repoName),
      fetchReadme(owner, repoName)
    ]);

    if (!repoInfo) {
      return NextResponse.json(
        { error: 'Failed to fetch repository information. Repository may not exist or is private.' },
        { status: 404 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.' },
        { status: 503 }
      );
    }

    // Generate summary using LangChain and OpenAI with structured output
    const analysis = await generateSummary(repoInfo, readmeContent);

    return NextResponse.json({
      repository: {
        name: repoInfo.name,
        fullName: repoInfo.full_name,
        description: repoInfo.description,
        url: repoInfo.html_url,
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        language: repoInfo.language,
        topics: repoInfo.topics || [],
        createdAt: repoInfo.created_at,
        updatedAt: repoInfo.updated_at,
      },
      analysis: {
        purpose: analysis.purpose,
        features: analysis.features,
        techStack: analysis.techStack,
        targetAudience: analysis.targetAudience,
        summary: analysis.summary,
      },
      status: 'completed'
    }, { status: 200 });
  } catch (error) {
    console.error('Server error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helper function to fetch repository information from GitHub API
async function fetchRepoInfo(owner: string, repo: string): Promise<GitHubRepoInfo | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Summarizer-API',
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` })
      }
    });

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching repo info:', error);
    return null;
  }
}

// Helper function to fetch README content
async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Summarizer-API',
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` })
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    // Decode base64 content
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    // Truncate if too long (to avoid token limits)
    return content.length > 10000 ? content.substring(0, 10000) + '...' : content;
  } catch (error) {
    console.error('Error fetching README:', error);
    return null;
  }
}

