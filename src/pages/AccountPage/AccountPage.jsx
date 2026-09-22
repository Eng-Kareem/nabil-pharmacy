import {
    UserRound
} from "lucide-react";

import {
    useAuth
} from "../../context/AuthContext.jsx";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import CustomerAccount
    from "../CustomerAccount/CustomerAccount.jsx";

import CustomerProfile
    from "../CustomerProfile/CustomerProfile.jsx";


function AccountPage() {

    const {
        user,
        authLoading
    } = useAuth();


    const {
        isArabic
    } = useLanguage();


    /*
    ========================================================
    WAIT FOR SUPABASE AUTH
    ========================================================

    Without this, the login page can briefly appear before
    Supabase finishes restoring an existing user session.
    */

    if (
        authLoading
    ) {

        return (

            <main
                style={{
                    minHeight:
                        "70vh",

                    display:
                        "grid",

                    placeItems:
                        "center",

                    padding:
                        "30px",

                    background:
                        "#f7f7f8"
                }}
                dir={
                    isArabic
                        ? "rtl"
                        : "ltr"
                }
            >

                <div
                    style={{
                        display:
                            "flex",

                        alignItems:
                            "center",

                        gap:
                            "10px",

                        color:
                            "#74747c",

                        fontWeight:
                            "800"
                    }}
                >

                    <UserRound
                        size={27}
                    />


                    {
                        isArabic
                            ? "جاري تحميل حسابك..."
                            : "Loading your account..."
                    }

                </div>

            </main>

        );

    }


    /*
    ========================================================
    LOGGED IN
    ========================================================
    */

    if (
        user
    ) {

        return (

            <CustomerProfile />

        );

    }


    /*
    ========================================================
    NOT LOGGED IN
    ========================================================
    */

    return (

        <CustomerAccount />

    );

}


export default AccountPage;