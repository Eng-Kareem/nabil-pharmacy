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
