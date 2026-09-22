import {
    Mail,
    Phone,
    User
} from "lucide-react";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import checkoutTranslations
    from "../../i18n/checkoutTranslations.js";

import "./ContactPhone.css";


function ContactPhone({
    formData,
    handleChange
}) {

    const {
        language,
        isArabic
    } = useLanguage();


    const text =
        checkoutTranslations[
            language
        ] ||
        checkoutTranslations.en;


    const initials =
        formData.fullName
            ? formData.fullName
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map(
                    word =>
                        word
                            .charAt(0)
                            .toUpperCase()
                )
                .join("")
            : isArabic
                ? "ن"
                : "NP";


    return (

        <section className="checkout-card contact-phone-section">


            <div className="checkout-card-heading">

                <span>
                    {isArabic ? "٠١" : "01"}
                </span>


                <div>

                    <h2>
                        {text.contactDetails}
                    </h2>


                    <p>
                        {text.contactDetailsDescription}
                    </p>

                </div>

            </div>


            <div className="contact-phone-layout">


                <div className="contact-phone-device">

                    <div className="contact-phone-frame">

                        <div className="contact-phone-screen">


                            <div className="contact-phone-status">

                                <span>
                                    {isArabic ? "٩:٤١" : "9:41"}
                                </span>


                                <div className="contact-phone-status-icons">

                                    <span className="phone-signal">
                                        ▮▮▮
                                    </span>

                                    <span>
                                        {isArabic ? "واي فاي" : "WiFi"}
                                    </span>

                                    <span className="phone-battery">
                                    </span>

                                </div>

                            </div>


                            <div className="contact-phone-island">

                                <span className="contact-phone-camera">
                                </span>

                            </div>


                            <div className="contact-phone-app-header">

                                <span>
                                    {isArabic ? "صيدلية نبيل" : "Nabil Pharmacy"}
                                </span>

                                <strong>
                                    {text.contact}
                                </strong>

                            </div>


                            <div className="contact-phone-profile">

                                <div className="contact-phone-avatar">
                                    {initials}
                                </div>


                                <h3>
                                    {
                                        formData.fullName ||
                                        text.yourName
                                    }
                                </h3>


                                <p>
                                    {
                                        formData.phone ||
                                        text.yourPhoneNumber
                                    }
                                </p>


                                <div className="contact-phone-actions">

                                    <div>

                                        <Phone
                                            size={17}
                                        />

                                        <span>
                                            {text.call}
                                        </span>

                                    </div>


                                    <div>

                                        <Mail
                                            size={17}
                                        />

                                        <span>
                                            {text.email}
                                        </span>

                                    </div>


                                    <div>

                                        <User
                                            size={17}
                                        />

                                        <span>
                                            {text.contactAction}
                                        </span>

                                    </div>

                                </div>

                            </div>


                            <div className="contact-phone-form">


                                <div className="contact-phone-field">

                                    <label htmlFor="fullName">
                                        {text.fullName}
                                    </label>


                                    <div className="contact-phone-input">

                                        <User
                                            size={17}
                                        />


                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            value={
                                                formData.fullName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder={
                                                text.fullNamePlaceholder
                                            }
                                            autoComplete="name"
                                            required
                                        />

                                    </div>

                                </div>


                                <div className="contact-phone-field">

                                    <label htmlFor="phone">
                                        {text.phoneNumber}
                                    </label>


                                    <div className="contact-phone-input">

                                        <Phone
                                            size={17}
                                        />


                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={
                                                formData.phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder={
                                                text.phonePlaceholder
                                            }
                                            autoComplete="tel"
                                            required
                                        />

                                    </div>

                                </div>


                                <div className="contact-phone-field">

                                    <label htmlFor="email">
                                        {text.emailAddress}
                                    </label>


                                    <div className="contact-phone-input">

                                        <Mail
                                            size={17}
                                        />


                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={
                                                formData.email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder={
                                                text.emailPlaceholder
                                            }
                                            autoComplete="email"
                                        />

                                    </div>

                                </div>

                            </div>


                            <div className="contact-phone-home-indicator">
                            </div>

                        </div>

                    </div>

                </div>


                <div className="contact-phone-side">

                    <span className="section-label">
                        {text.liveContactPreview}
                    </span>


                    <h3>
                        {text.detailsInsidePhone}
                    </h3>


                    <p>
                        {text.phonePreviewDescription}
                    </p>


                    <div className="contact-phone-side-card">

                        <User />


                        <div>

                            <span>
                                {text.customer}
                            </span>


                            <strong>
                                {
                                    formData.fullName ||
                                    text.notEntered
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="contact-phone-side-card">

                        <Phone />


                        <div>

                            <span>
                                {text.phone}
                            </span>


                            <strong>
                                {
                                    formData.phone ||
                                    text.notEntered
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="contact-phone-side-card">

                        <Mail />


                        <div>

                            <span>
                                {text.email}
                            </span>


                            <strong>
                                {
                                    formData.email ||
                                    text.optional
                                }
                            </strong>

                        </div>

                    </div>

                </div>

            </div>

        </section>

    );

}


export default ContactPhone;