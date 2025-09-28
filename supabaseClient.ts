
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// TODO: Replace with your project's credentials
// 1. Go to your Supabase project dashboard.
// 2. Go to the "Project Settings" page.
// 3. Go to the "API" tab.
// 4. Find your "Project URL" and "Project API keys" (use the anon, public one).
// FIX: Explicitly type as string to avoid a TypeScript error on line 14 where this constant is compared to a placeholder string.
const supabaseUrl: string = 'https://sonyhgkrecylthgvncvh.supabase.co';
// FIX: Explicitly type as string to avoid a TypeScript error on line 16 where this constant is compared to a placeholder string.
const supabaseKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbnloZ2tyZWN5bHRoZ3ZuY3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjUwMjIsImV4cCI6MjA3NDMwMTAyMn0.2_8TM10E4rIFkVn5U9a1YKK9szDjLYDhl0mh0b9QRgg';

export const isSupabaseConfigured =
    supabaseUrl &&
    supabaseUrl !== 'YOUR_SUPABASE_URL' &&
    supabaseKey &&
    supabaseKey !== 'YOUR_SUPABASE_ANON_KEY';

// The global declaration is necessary because the Supabase SDK is loaded from a CDN.
// This tells TypeScript that `createClient` will be available globally.
declare global {
    const supabase: {
        createClient: typeof createClient;
    };
}

let supabase: SupabaseClient;
if (isSupabaseConfigured) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    // A warning will be shown in the console, and the UI will guide the user.
    console.warn("Supabase credentials are not configured in supabaseClient.ts");
}

export { supabase };
