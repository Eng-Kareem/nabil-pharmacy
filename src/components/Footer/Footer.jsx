import {
    Code2,
    Mail,
    Phone,
    ShieldCheck
} from "lucide-react";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import "./Footer.css";


/*
========================================================
INSTAGRAM ICON
========================================================

Inline SVG so the footer does not depend on whether the
installed lucide-react version includes Instagram.
*/

function InstagramIcon({
    size = 17
}) {

    return (

        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >

            <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="5"
                ry="5"
            />


            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />


            <line
                x1="17.5"
                y1="6.5"
                x2="17.51"
                y2="6.5"
            />

        </svg>

    );

}



function Footer() {

    const {
        isArabic
    } = useLanguage();


    const currentYear =
        new Date()
            .getFullYear();


    const displayedYear =
        currentYear.toLocaleString(
            isArabic
                ? "ar-EG"
                : "en-US",
            {
                useGrouping:
                    false
            }
        );


    const text =
        isArabic
            ? {

                pharmacy:
                    "صيدلية نبيل",

                since:
                    "منذ عام ١٩٧٥",

                group:
                    "مجموعة H.O",

                poweredBy:
                    "تم تطوير الموقع بواسطة",

                developer:
                    "كريم محمد الخولي",

                developerRole:
                    "تطوير وتصميم الموقع",

                manager:
                    "مدير الصيدلية",

                managerContact:
                    "بيانات التواصل مع مدير الصيدلية",

                instagram:
                    "إنستجرام",

                email:
                    "البريد الإلكتروني",

                phone:
                    "رقم الهاتف",

                copyright:
                    `© ${displayedYear} صيدلية نبيل. جميع الحقوق محفوظة.`,

                secure:
                    "موقع صيدلية نبيل"

            }
            : {

                pharmacy:
                    "Nabil Pharmacy",

                since:
                    "Since 1975",

                group:
                    "H.O Group",

                poweredBy:
                    "Website powered by",

                developer:
                    "Kareem Mohamed Elkhouly",

                developerRole:
                    "Website Development & Design",

                manager:
                    "Pharmacy Manager",

                managerContact:
                    "Pharmacy Manager Contact",

                instagram:
                    "Instagram",

                email:
                    "Email",

                phone:
                    "Phone",

                copyright:
                    `© ${displayedYear} Nabil Pharmacy. All rights reserved.`,

                secure:
                    "Nabil Pharmacy Website"

            };


    return (

        <footer
            className="footer"
            dir={
                isArabic
                    ? "rtl"
                    : "ltr"
            }
        >

            {/* =============================================
                TOP HERITAGE LINE
            ============================================= */}

            <div className="footer-pattern">
            </div>


            <div className="container footer-content">


                {/* =========================================
                    BRAND
                ========================================= */}

                <div className="footer-brand-section">

                    <div className="footer-brand">

                        <img
                            src="/nabil-logo.png"
                            alt={
                                text.pharmacy
                            }
                        />


                        <div className="footer-brand-copy">

                            <strong>

                                {
                                    text.pharmacy
                                }

                            </strong>


                            <span>

                                {
                                    text.since
                                }

                            </span>


                            <small>

                                {
                                    text.group
                                }

                            </small>

                        </div>

                    </div>


                    <div className="footer-pharmacy-note">

                        <ShieldCheck
                            size={16}
                        />


                        <span>

                            {
                                text.secure
                            }

                        </span>

                    </div>

                </div>


                {/* =========================================
                    DEVELOPER
                ========================================= */}

                <section className="footer-contact-section">

                    <div className="footer-section-heading">

                        <Code2
                            size={19}
                        />


                        <div>

                            <span>

                                {
                                    text.poweredBy
                                }

                            </span>


                            <strong>

                                {
                                    text.developer
                                }

                            </strong>

                        </div>

                    </div>


                    <p className="footer-role">

                        {
                            text.developerRole
                        }

                    </p>


                    <div className="footer-contact-links">


                        {/* DEVELOPER INSTAGRAM */}

                        <a
                            href="https://www.instagram.com/kimo_mo11/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-contact-link"
                            aria-label="Kareem Mohamed Elkhouly Instagram"
                        >

                            <span className="footer-contact-icon">

                                <InstagramIcon
                                    size={17}
                                />

                            </span>


                            <span className="footer-contact-text">

                                <small>

                                    {
                                        text.instagram
                                    }

                                </small>


                                <strong
                                    dir="ltr"
                                >

                                    @kimo_mo11

                                </strong>

                            </span>

                        </a>


                        {/* DEVELOPER EMAIL */}

                        <a
                            href="mailto:kareem.ramos22@gmail.com"
                            className="footer-contact-link"
                        >

                            <span className="footer-contact-icon">

                                <Mail
                                    size={17}
                                />

                            </span>


                            <span className="footer-contact-text">

                                <small>

                                    {
                                        text.email
                                    }

                                </small>


                                <strong
                                    dir="ltr"
                                >

                                    kareem.ramos22@gmail.com

                                </strong>

                            </span>

                        </a>

                    </div>

                </section>


                {/* =========================================
                    PHARMACY MANAGER
                ========================================= */}

                <section className="footer-contact-section">

                    <div className="footer-section-heading">

                        <ShieldCheck
                            size={19}
                        />


                        <div>

                            <span>

                                {
                                    text.managerContact
                                }

                            </span>


                            <strong>

                                {
                                    text.manager
                                }

                            </strong>

                        </div>

                    </div>


                    <div className="footer-contact-links">


                        {/* MANAGER INSTAGRAM */}

                        <a
                            href="https://www.instagram.com/mohamednabiliii/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-contact-link"
                            aria-label="Pharmacy manager Instagram"
                        >

                            <span className="footer-contact-icon">

                                <InstagramIcon
                                    size={17}
                                />

                            </span>


                            <span className="footer-contact-text">

                                <small>

                                    {
                                        text.instagram
                                    }

                                </small>


                                <strong
                                    dir="ltr"
                                >

                                    @mohamednabiliii

                                </strong>

                            </span>

                        </a>


                        {/* MANAGER EMAIL */}

                        <a
                            href="mailto:Specialist0072@gmail.com"
                            className="footer-contact-link"
                        >

                            <span className="footer-contact-icon">

                                <Mail
                                    size={17}
                                />

                            </span>


                            <span className="footer-contact-text">

                                <small>

                                    {
                                        text.email
                                    }

                                </small>


                                <strong
                                    dir="ltr"
                                >

                                    Specialist0072@gmail.com

                                </strong>

                            </span>

                        </a>


                        {/* MANAGER PHONE */}

                        <a
                            href="tel:01001728172"
                            className="footer-contact-link"
                        >

                            <span className="footer-contact-icon">

                                <Phone
                                    size={17}
                                />

                            </span>


                            <span className="footer-contact-text">

                                <small>

                                    {
                                        text.phone
                                    }

                                </small>


                                <strong
                                    dir="ltr"
                                >

                                    0100 172 8 172

                                </strong>

                            </span>

                        </a>

                    </div>

                </section>

            </div>


            {/* =============================================
                BOTTOM
            ============================================= */}

            <div className="footer-bottom">

                <div className="container footer-bottom-inner">

                    <p>

                        {
                            text.copyright
                        }

                    </p>


                    <p className="footer-powered-bottom">

                        <Code2
                            size={14}
                        />


                        <span>

                            {
                                text.poweredBy
                            }

                        </span>


                        <strong>

                            {
                                text.developer
                            }

                        </strong>

                    </p>

                </div>

            </div>

        </footer>

    );

}


export default Footer;