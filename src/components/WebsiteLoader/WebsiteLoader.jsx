import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import "./WebsiteLoader.css";


function WebsiteLoader({
    leaving = false
}) {

    const {
        isArabic
    } = useLanguage();


    const text =
        isArabic
            ? {

                welcome:
                    "مرحبًا بك في",

                pharmacy:
                    "صيدلية نبيل",

                since:
                    "منذ عام ١٩٧٥",

                preparing:
                    "جاري تجهيز صيدليتك",

                bottomPharmacy:
                    "صيدلية نبيل",

                group:
                    "مجموعة H.O",

                logoAlt:
                    "صيدلية نبيل"

            }
            : {

                welcome:
                    "Welcome to",

                pharmacy:
                    "Nabil Pharmacy",

                since:
                    "Since 1975",

                preparing:
                    "Preparing your pharmacy",

                bottomPharmacy:
                    "NABIL PHARMACY",

                group:
                    "H.O GROUP",

                logoAlt:
                    "Nabil Pharmacy"

            };


    return (

        <div
            className={
                leaving
                    ? "website-loader website-loader-leaving"
                    : "website-loader"
            }
            dir={
                isArabic
                    ? "rtl"
                    : "ltr"
            }
        >

            {/* BACKGROUND */}

            <div className="website-loader-orb loader-orb-one">
            </div>


            <div className="website-loader-orb loader-orb-two">
            </div>


            {/* MAIN */}

            <div className="website-loader-content">


                {/* LOGO */}

                <div className="website-loader-logo-area">

                    <div className="website-loader-ring website-loader-ring-outer">
                    </div>


                    <div className="website-loader-ring website-loader-ring-inner">
                    </div>


                    <div className="website-loader-logo-container">

                        <img
                            src="/nabil-logo.png"
                            alt={
                                text.logoAlt
                            }
                            className="website-loader-logo"
                        />

                    </div>


                    <div className="website-loader-pulse">
                    </div>

                </div>


                {/* BRAND */}

                <div className="website-loader-brand">

                    <span className="website-loader-small-title">

                        {
                            text.welcome
                        }

                    </span>


                    <h1>

                        {
                            text.pharmacy
                        }

                    </h1>


                    <div className="website-loader-since">

                        <span>
                        </span>


                        <strong>

                            {
                                text.since
                            }

                        </strong>


                        <span>
                        </span>

                    </div>

                </div>


                {/* STATUS */}

                <div
                    className="website-loader-status"
                    aria-live="polite"
                >

                    <span>

                        {
                            text.preparing
                        }

                    </span>


                    <div className="website-loader-dots">

                        <i>
                        </i>

                        <i>
                        </i>

                        <i>
                        </i>

                    </div>

                </div>

            </div>


            {/* BOTTOM */}

            <div className="website-loader-bottom">

                <span>

                    {
                        text.bottomPharmacy
                    }

                </span>


                <span className="website-loader-bottom-dot">
                </span>


                <span>

                    {
                        text.group
                    }

                </span>

            </div>

        </div>

    );

}


export default WebsiteLoader;