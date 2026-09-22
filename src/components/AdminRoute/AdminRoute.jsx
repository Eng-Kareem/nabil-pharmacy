import {
    useEffect,
    useState
} from "react";

import {
    Navigate
} from "react-router-dom";

import {
    supabase
} from "../../lib/supabase.js";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";


function AdminRoute({
    children
}) {

    const {
        isArabic
    } = useLanguage();


    const [
        loading,
        setLoading
    ] = useState(
        true
    );


    const [
        allowed,
        setAllowed
    ] = useState(
        false
    );


    useEffect(
        () => {

            let mounted =
                true;


            const checkAdmin =
                async () => {

                    try {

                        const {
                            data: {
                                user
                            }
                        } =
                            await supabase
                                .auth
                                .getUser();


                        if (
                            !user
                        ) {

                            if (
                                mounted
                            ) {

                                setAllowed(
                                    false
                                );

                                setLoading(
                                    false
                                );

                            }


                            return;

                        }


                        const {
                            data:
                                profile,

                            error
                        } =
                            await supabase
                                .from(
                                    "profiles"
                                )
                                .select(
                                    "role"
                                )
                                .eq(
                                    "id",
                                    user.id
                                )
                                .single();


                        if (
                            error
                        ) {

                            throw error;

                        }


                        if (
                            mounted
                        ) {

                            setAllowed(

                                profile?.role ===
                                    "admin" ||

                                profile?.role ===
                                    "super_admin"

                            );

                        }

                    } catch (
                        error
                    ) {

                        console.error(
                            "Admin authorization error:",
                            error
                        );


                        if (
                            mounted
                        ) {

                            setAllowed(
                                false
                            );

                        }

                    } finally {

                        if (
                            mounted
                        ) {

                            setLoading(
                                false
                            );

                        }

                    }

                };


            checkAdmin();


            const {
                data:
                    listener
            } =
                supabase
                    .auth
                    .onAuthStateChange(
                        () => {

                            checkAdmin();

                        }
                    );


            return () => {

                mounted =
                    false;


                listener
                    .subscription
                    .unsubscribe();

            };

        },
        []
    );


    if (
        loading
    ) {

        return (

            <div
                style={{
                    minHeight:
                        "70vh",

                    display:
                        "grid",

                    placeItems:
                        "center",

                    padding:
                        "20px",

                    fontWeight:
                        800
                }}
            >

                {
                    isArabic
                        ? "جاري التحقق من صلاحيات المسؤول..."
                        : "Checking administrator access..."
                }

            </div>

        );

    }


    if (
        !allowed
    ) {

        return (

            <Navigate
                to="/admin/login"
                replace
            />

        );

    }


    return children;

}


export default AdminRoute;