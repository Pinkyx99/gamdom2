// FIX: Updated the Supabase functions type reference to point to the module root. The previous path to a specific .d.ts file was not being resolved correctly, causing type errors for the Deno runtime.
// FIX: The type reference below was invalid and caused conflicts with the Deno runtime environment. It has been removed as it is not used in this file.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";

// FIX: Declare Deno to fix TypeScript error 'Cannot find name 'Deno''.
declare const Deno: any;

console.log("Crash Tick function initializing!");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize the Supabase client once per function instance.
// Using the standard initialization is more robust.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    // Consume the request body to prevent the request from hanging.
    await req.json().catch(() => ({}));
    
    // Call the game loop function in the database.
    const { data, error } = await supabase.rpc('crash_game_tick');

    if (error) {
      console.error("Error calling crash_game_tick:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Critical error in Edge Function:", err.message);
    return new Response(String(err?.message ?? err), { status: 500, headers: corsHeaders });
  }
});