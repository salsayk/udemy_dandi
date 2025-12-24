import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// GitHub repository information interface
export interface GitHubRepoInfo {
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

// Generate summary using LangChain and OpenAI
export async function generateSummary(repoInfo: GitHubRepoInfo, readmeContent: string | null): Promise<string> {
  const model = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0,
  });

  const systemPrompt = `You are a technical analyst who summarizes GitHub repositories. 
Provide a concise, informative summary that includes:
1. What the project does (main purpose)
2. Key features and capabilities
3. Technology stack used
4. Who would benefit from using it
Keep the summary to 3-4 paragraphs maximum.`;

  const repoContext = `
Repository: ${repoInfo.full_name}
Description: ${repoInfo.description || 'No description provided'}
Primary Language: ${repoInfo.language || 'Not specified'}
Topics: ${repoInfo.topics?.join(', ') || 'None'}
Stars: ${repoInfo.stargazers_count}
Forks: ${repoInfo.forks_count}
${readmeContent ? `\nREADME Content:\n${readmeContent}` : ''}
`;

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(`Please summarize this GitHub repository:\n${repoContext}`)
  ];

  const response = await model.invoke(messages);
  return response.content as string;
}

