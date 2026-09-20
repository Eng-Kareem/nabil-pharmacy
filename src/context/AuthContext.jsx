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
    INITIAL AUTH CHECK
    ========================================================
    */

    useEffect(() => {

        let mounted = true;


        const loadUser =
            async () => {

                try {

                    const {
                        data,
                        error
                    } =
                        await supabase
                            .auth
                            .getUser();


                    if (error) {

                        console.warn(
                            "Auth user check:",
                            error.message
                        );
                    }


                    if (
                        mounted
                    ) {

                        setUser(
                            data?.user ||
                            null
                        );

                        setAuthLoading(
                            false
                        );
                    }

                } catch (error) {

                    console.error(
                        "Initial auth error:",
                        error
                    );


                    if (
                        mounted
                    ) {

                        setUser(null);

                        setAuthLoading(false);
                    }
                }
            };


        loadUser();



        /*
        ====================================================
        LISTEN FOR LOGIN / LOGOUT
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
                            session?.user ||
                            null
                        );


                        setAuthLoading(
                            false
                        );


                        if (
                            event ===
                            "SIGNED_IN"
                        ) {

                            sessionStorage.removeItem(
                                "nabil-checkout-guest"
                            );
                        }

                    }
                );


        return () => {

            mounted = false;


            authListener
                ?.subscription
                ?.unsubscribe();
        };

    }, []);



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


            if (error) {
                throw error;
            }


            setUser(null);
        };



    const value =
        useMemo(
            () => ({

                user,

                authLoading,

                isAuthenticated:
                    Boolean(user),

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

            {children}

        </AuthContext.Provider>

    );
}



export function useAuth() {

    const context =
        useContext(
            AuthContext
        );


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider."
        );
    }


    return context;
}