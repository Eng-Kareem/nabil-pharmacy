import {
    createClient
} from "@supabase/supabase-js";


const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL;


const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY;


if (
    !supabaseUrl ||
    !supabaseAnonKey
) {

    throw new Error(
        "Missing Supabase environment variables."
    );

}


/*
========================================================
AUTH STORAGE
========================================================

Use a new app-specific storage key.

This prevents the website from loading the old broken
refresh-token session stored by previous deployments.

All users will simply need to log in once again after
this deployment.
========================================================
*/

const authStorageKey =
    "nabil-pharmacy-auth-v2";


export const supabase =
    createClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storageKey:
                    authStorageKey
            }
        }
    );