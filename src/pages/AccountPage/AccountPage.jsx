import {
    FileText,
    Upload,
    UserRound
} from "lucide-react";

import {
    Link
} from "react-router-dom";

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


    if (
        user
    ) {

        return (

            <>

                <div
                    dir={
                        isArabic
                            ? "rtl"
                            : "ltr"
                    }
                    style={{
                        padding:
                            "18px max(20px, calc((100vw - 1240px) / 2)) 0",

                        display:
                            "flex",

                        justifyContent:
                            "flex-end",

                        gap:
                            "9px",

                        flexWrap:
                            "wrap",

                        background:
                            "#f7f7f8"
                    }}
                >

                    <Link
                        to="/account/prescriptions"
                        style={{
                            minHeight:
                                "43px",

                            padding:
                                "0 14px",

                            display:
                                "inline-flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",

                            gap:
                                "7px",

                            border:
                                "1px solid #e1e1e4",

                            borderRadius:
                                "11px",

                            background:
                                "#ffffff",

                            color:
                                "#19191d",

                            fontSize:
                                "0.68rem",

                            fontWeight:
                                "900",

                            textDecoration:
                                "none"
                        }}
                    >

                        <FileText
                            size={17}
                        />


                        {
                            isArabic
                                ? "روشتاتي"
                                : "My Prescriptions"
                        }

                    </Link>


                    <Link
                        to="/prescription"
                        style={{
                            minHeight:
                                "43px",

                            padding:
                                "0 14px",

                            display:
                                "inline-flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",

                            gap:
                                "7px",

                            border:
                                "1px solid #aa1018",

                            borderRadius:
                                "11px",

                            background:
                                "#aa1018",

                            color:
                                "#ffffff",

                            fontSize:
                                "0.68rem",

                            fontWeight:
                                "900",

                            textDecoration:
                                "none"
                        }}
                    >

                        <Upload
                            size={17}
                        />


                        {
                            isArabic
                                ? "رفع روشتة"
                                : "Upload Prescription"
                        }

                    </Link>

                </div>


                <CustomerProfile />

            </>

        );

    }


    return (

        <CustomerAccount />

    );

}


export default AccountPage;