import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

// Import environment variables
const TICKTICK_CLIENT_ID = process.env.EXPO_PUBLIC_TICKTICK_CLIENT_ID;
const TICKTICK_CLIENT_SECRET = process.env.TICKTICK_CLIENT_SECRET;
const TICKTICK_REDIRECT_URI = process.env.EXPO_PUBLIC_TICKTICK_REDIRECT_URI;

// TickTick OAuth endpoints
const TICKTICK_AUTH_URL = 'https://ticktick.com/oauth/authorize';
const TICKTICK_TOKEN_URL = 'https://ticktick.com/oauth/token';
const TICKTICK_API_URL = 'https://api.ticktick.com/open/v1';

interface Task {
  id: string;
  title: string;
  startDate?: string;
  dueDate?: string;
  priority: number;
  status: number;
  projectId: string;
}

// Step 1: Start OAuth flow
export async function loginToTickTick() {
  try {
    console.log("Creating auth request...");
    
    // Create auth request with PKCE
    const authRequest = new AuthSession.AuthRequest({
      clientId: TICKTICK_CLIENT_ID!,
      redirectUri: TICKTICK_REDIRECT_URI!,
      scopes: ['tasks:read'],
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true, // This auto-generates codeVerifier
    });

    console.log("Opening TickTick login page...");
    
    // Open TickTick login page
    const result = await authRequest.promptAsync({
      authorizationEndpoint: TICKTICK_AUTH_URL,
    });

    console.log("Auth result:", result.type);

    if (result.type === 'success') {
      const { code } = result.params;
      
      // Get the auto-generated code verifier
      const codeVerifier = authRequest.codeVerifier;
      
      console.log("Got authorization code, exchanging for token...");
      
      const tokens = await exchangeCodeForToken(code, codeVerifier!);
      return tokens;
    } else {
      throw new Error(`Authentication failed: ${result.type}`);
    }
  } catch (error) {
    console.error('TickTick login error:', error);
    throw error;
  }
}

// Step 2: Exchange authorization code for access token
async function exchangeCodeForToken(code: string, codeVerifier: string) {
  try {
    console.log("Exchanging code for token...");
    
    const response = await fetch(TICKTICK_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TICKTICK_CLIENT_ID!,
        client_secret: TICKTICK_CLIENT_SECRET!,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: TICKTICK_REDIRECT_URI!,
        code_verifier: codeVerifier,
      }).toString(),
    });

    const data = await response.json();
    
    console.log("Token exchange response status:", response.status);
    
    if (!response.ok) {
      console.error("Token exchange error:", data);
      throw new Error(`Token exchange failed: ${data.error_description || data.error || 'Unknown error'}`);
    }

    console.log("Successfully got access token!");

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error("Error in exchangeCodeForToken:", error);
    throw error;
  }
}

// Step 3: Fetch today's tasks
export async function getTodaysTasks(accessToken: string): Promise<Task[]> {
  try {
    console.log("Fetching tasks from TickTick...");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await fetch(`${TICKTICK_API_URL}/task`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch tasks:", response.status, errorText);
      throw new Error(`Failed to fetch tasks: ${response.status}`);
    }

    const tasks: Task[] = await response.json();
    
    console.log(`Fetched ${tasks.length} total tasks`);

    // Filter for tasks due today or with today's start date
    const todaysTasks = tasks.filter(task => {
      if (!task.dueDate && !task.startDate) return false;
      
      const taskDate = new Date(task.dueDate || task.startDate!);
      return taskDate >= today && taskDate < tomorrow;
    });

    console.log(`Found ${todaysTasks.length} tasks for today`);

    // Sort by priority (higher first) then by due time
    return todaysTasks.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      const aDate = new Date(a.dueDate || a.startDate || 0);
      const bDate = new Date(b.dueDate || b.startDate || 0);
      return aDate.getTime() - bDate.getTime();
    });
  } catch (error) {
    console.error("Error in getTodaysTasks:", error);
    throw error;
  }
}
