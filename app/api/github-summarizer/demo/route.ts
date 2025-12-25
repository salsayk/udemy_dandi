import { NextResponse } from 'next/server';
import { generateSummary, GitHubRepoInfo } from '../chain';

// Simple in-memory rate limiting (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3; // 3 requests per day
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function getRateLimitKey(request: Request): string {
  // Use IP address or a hash of headers as the rate limit key
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

// GitHub API repository interface (different from chain.ts GitHubRepoInfo)
interface GitHubApiRepoInfo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
}

// Fetch repository info from GitHub API
async function fetchRepoInfo(owner: string, repo: string): Promise<GitHubApiRepoInfo | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Dandi-GitHub-Analyzer',
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

// Fetch README content from GitHub
async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Dandi-GitHub-Analyzer',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    // Decode base64 content
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    // Limit README content to first 2000 characters for demo
    return content.slice(0, 2000);
  } catch {
    return null;
  }
}

// Generate a simple summary without OpenAI (fallback)
function generateFallbackSummary(repoInfo: GitHubApiRepoInfo): {
  purpose: string;
  features: string[];
  techStack: string[];
  targetAudience: string;
  summary: string;
} {
  const language = repoInfo.language || 'Unknown';
  const topics = repoInfo.topics || [];
  
  return {
    purpose: repoInfo.description || `A ${language} project hosted on GitHub.`,
    features: [
      `Written primarily in ${language}`,
      `${repoInfo.stargazers_count.toLocaleString()} stars on GitHub`,
      `${repoInfo.forks_count.toLocaleString()} forks`,
      topics.length > 0 ? `Topics: ${topics.slice(0, 3).join(', ')}` : 'Open source project',
    ],
    techStack: [language, ...topics.slice(0, 4)].filter(Boolean),
    targetAudience: `Developers interested in ${language} and ${topics[0] || 'open source'} projects.`,
    summary: `${repoInfo.full_name} is ${repoInfo.description ? `a project that ${repoInfo.description.toLowerCase()}` : `a ${language} repository`}. With ${repoInfo.stargazers_count.toLocaleString()} stars and ${repoInfo.forks_count.toLocaleString()} forks, it has gained attention in the developer community. ${topics.length > 0 ? `The project focuses on ${topics.slice(0, 3).join(', ')}.` : ''} This is a demo response - sign up for full AI-powered analysis.`,
  };
}

export async function POST(request: Request) {
  try {
    // Check rate limit
    const rateLimitKey = getRateLimitKey(request);
    const { allowed, remaining } = checkRateLimit(rateLimitKey);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again tomorrow or sign up for an API key.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Limit': String(RATE_LIMIT),
          }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    
    if (!body.githubUrl) {
      return NextResponse.json(
        { error: 'Missing required field: githubUrl' },
        { status: 400 }
      );
    }

    // Parse GitHub URL
    const githubUrlPattern = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?.*$/;
    const match = body.githubUrl.match(githubUrlPattern);

    if (!match) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format. Expected: https://github.com/owner/repository' },
        { status: 400 }
      );
    }

    const [, owner, repo] = match;

    // Fetch repository information
    const repoInfo = await fetchRepoInfo(owner, repo.replace(/\.git$/, ''));

    if (!repoInfo) {
      return NextResponse.json(
        { error: 'Repository not found or not accessible' },
        { status: 404 }
      );
    }

    // Fetch README for better AI analysis
    const readmeContent = await fetchReadme(owner, repo.replace(/\.git$/, ''));

    // Try to use AI summarizer if OpenAI API key is available
    let analysis;
    let usedAI = false;

    if (process.env.OPENAI_API_KEY) {
      try {
        // Convert to the format expected by generateSummary
        const repoInfoForAI: GitHubRepoInfo = {
          name: repoInfo.name,
          full_name: repoInfo.full_name,
          description: repoInfo.description,
          html_url: repoInfo.html_url,
          stargazers_count: repoInfo.stargazers_count,
          forks_count: repoInfo.forks_count,
          language: repoInfo.language,
          topics: repoInfo.topics || [],
          created_at: repoInfo.created_at,
          updated_at: repoInfo.updated_at,
        };
        
        analysis = await generateSummary(repoInfoForAI, readmeContent);
        usedAI = true;
      } catch (aiError) {
        console.error('AI summarization failed, falling back to basic summary:', aiError);
        analysis = generateFallbackSummary(repoInfo);
      }
    } else {
      analysis = generateFallbackSummary(repoInfo);
    }

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
      analysis,
      status: 'completed',
      demo: true,
      aiPowered: usedAI,
      rateLimit: {
        remaining,
        limit: RATE_LIMIT,
      }
    }, { 
      status: 200,
      headers: {
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Limit': String(RATE_LIMIT),
      }
    });

  } catch (error) {
    console.error('Demo API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

