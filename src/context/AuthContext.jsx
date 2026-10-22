import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    supabase
} from "../lib/supabase.js";


const AuthContext =
    createContext(null);


export function AuthProvider({
    children
}) {

    const [
        user,
        setUser
    ] = useState(null);


    const [
        authLoading,
        setAuthLoading
    ] = useState(true);


    /*
    ========================================================
    SINGLE AUTH LISTENER
    ========================================================

    Supabase automatically initializes its browser session.

    INITIAL_SESSION is delivered through onAuthStateChange,
    so we do not manually call getSession() or getUser()
    here.

    This prevents unnecessary refresh-token requests.
    ========================================================
    */

    useEffect(
        () => {

            let mounted =
                true;


            const {
                data: {
                    subscription
                }
            } =
                supabase
                    .auth
                    .onAuthStateChange(
                        (
                            event,
                            session
                        ) => {

                            if (
                                !mounted
                            ) {

                                return;

                            }


                            setUser(
                                session
                                    ?.user ||
                                null
                            );


                            setAuthLoading(
                                false
                            );


                            if (
                                event ===
                                "SIGNED_IN"
                            ) {

                                sessionStorage
                                    .removeItem(
                                        "nabil-checkout-guest"
                                    );

                            }

                        }
                    );


            /*
            ====================================================
            SAFETY FALLBACK
            ====================================================

            INITIAL_SESSION normally happens immediately.

            This only prevents the site from being stuck on
            the loading screen if browser storage fails.
            ====================================================
            */

            const loadingFallback =
                window.setTimeout(
                    () => {

                        if (
                            mounted
                        ) {

                            setAuthLoading(
                                false
                            );

                        }

                    },
                    5000
                );


            return () => {

                mounted =
                    false;


                window.clearTimeout(
                    loadingFallback
                );


                subscription
                    ?.unsubscribe();

            };

        },
        []
    );


    /*
    ========================================================
    LOGOUT
    ========================================================

    Logout only this browser session.

    Do not revoke the user's sessions on all devices.
    ========================================================
    */

    const signOut =
        async () => {

            const {
                error
            } =
                await supabase
                    .auth
                    .signOut({
                        scope:
                            "local"
                    });


            if (
                error
            ) {

                throw error;

            }


            setUser(
                null
            );

        };


    /*
    ========================================================
    CONTEXT
    ========================================================
    */

    const value =
        useMemo(
            () => ({

                user,

                authLoading,

                isAuthenticated:
                    Boolean(
                        user
                    ),

                signOut

            }),
            [
                user,
                authLoading
            ]
        );


    return (

        <AuthContext.Provider
            value={
                value
            }
        >

            {
                children
            }

        </AuthContext.Provider>

    );

}


export function useAuth() {

    const context =
        useContext(
            AuthContext
        );


    if (
        !context
    ) {

        throw new Error(
            "useAuth must be used inside AuthProvider."
        );

    }


    return context;

}