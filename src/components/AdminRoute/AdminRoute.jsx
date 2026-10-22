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
    useAuth
} from "../../context/AuthContext.jsx";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";


function AdminRoute({
    children
}) {

    const {
        user,
        authLoading
    } =
        useAuth();


    const {
        isArabic
    } =
        useLanguage();


    const [
        roleLoading,
        setRoleLoading
    ] =
        useState(true);


    const [
        allowed,
        setAllowed
    ] =
        useState(false);


    useEffect(
        () => {

            let mounted =
                true;


            const checkRole =
                async () => {

                    if (
                        authLoading
                    ) {

                        return;

                    }


                    if (
                        !user?.id
                    ) {

                        if (
                            mounted
                        ) {

                            setAllowed(false);
                            setRoleLoading(false);

                        }

                        return;

                    }


                    setRoleLoading(true);


                    try {

                        const {
                            data: profile,
                            error
                        } =
                            await supabase
                                .from("profiles")
                                .select("role")
                                .eq(
                                    "id",
                                    user.id
                                )
                                .maybeSingle();


                        if (
                            error
                        ) {

                            throw error;

                        }


                        const role =
                            profile?.role;


                        const hasAccess =
                            role === "admin" ||
                            role === "super_admin";


                        if (
                            mounted
                        ) {

                            setAllowed(
                                hasAccess
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

                            setAllowed(false);

                        }

                    } finally {

                        if (
                            mounted
                        ) {

                            setRoleLoading(false);

                        }

                    }

                };


            checkRole();


            return () => {

                mounted =
                    false;

            };

        },
        [
            user?.id,
            authLoading
        ]
    );


    if (
        authLoading ||
        roleLoading
    ) {

        return (

            <div
                style={{
                    minHeight: "70vh",
                    display: "grid",
                    placeItems: "center",
                    padding: "20px",
                    fontWeight: 800
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
        !user ||
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