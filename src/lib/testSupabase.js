import {
    supabase
} from "./supabase.js";


export async function testSupabaseConnection() {

    try {

        const {
            data,
            error
        } = await supabase.auth.getSession();


        if (error) {

            console.error(
                "❌ Supabase connection error:",
                error
            );

            return;
        }


        console.log(
            "✅ Supabase client connected successfully!"
        );


        console.log(
            "Session:",
            data.session
        );

    } catch (error) {

        console.error(
            "❌ Failed to connect to Supabase:",
            error
        );

    }
}