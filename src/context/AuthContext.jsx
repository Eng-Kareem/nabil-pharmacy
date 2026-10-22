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
    INITIAL SESSION
    ========================================================

    Read the locally persisted Supabase session.

    We do not repeatedly call getUser() from multiple
    components. Supabase handles token refreshing itself.
    ========================================================
    */

    useEffect(
        () => {

            let mounted =
                true;


            const loadSession =
                async () => {

                    try {

                        const {
                            data,
                            error
                        } =
                            await supabase
                                .auth
                                .getSession();


                        if (
                            error
                        ) {

                            console.warn(
                                "Session check:",
                                error.message
                            );

                        }


                        if (
                            !mounted
                        ) {

                            return;

                        }


                        setUser(
                            data
                                ?.session
                                ?.user ||
                            null
                        );


                        setAuthLoading(
                            false
                        );

                    } catch (
                        error
                    ) {

                        console.error(
                            "Initial session error:",
                            error
                        );


                        if (
                            mounted
                        ) {

                            setUser(
                                null
                            );


                            setAuthLoading(
                                false
                            );

                        }

                    }

                };


            loadSession();


            /*
            ====================================================
            CENTRAL AUTH LISTENER
            ====================================================
            */

            const {
                data:
                    authListener
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


            return () => {

                mounted =
                    false;


                authListener
                    ?.subscription
                    ?.unsubscribe();

            };

        },
        []
    );


    /*
    ========================================================
    LOGOUT
    ========================================================
    */

    const signOut =
        async () => {

            const {
                error
            } =
                await supabase
                    .auth
                    .signOut();


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
    CONTEXT VALUE
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