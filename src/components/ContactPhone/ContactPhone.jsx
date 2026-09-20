import {
    Mail,
    Phone,
    User
} from "lucide-react";

import "./ContactPhone.css";


function ContactPhone({
    formData,
    handleChange
}) {

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
            : "NP";


    return (
        <section className="checkout-card contact-phone-section">

            <div className="checkout-card-heading">

                <span>
                    01
                </span>

                <div>

                    <h2>
                        Contact Details
                    </h2>

                    <p>
                        Enter your details directly
                        into the interactive phone.
                    </p>

                </div>

            </div>


            <div className="contact-phone-layout">


                {/* =========================
                    PHONE
                ========================= */}

                <div className="contact-phone-device">

                    <div className="contact-phone-frame">

                        <div className="contact-phone-screen">


                            {/* STATUS BAR */}

                            <div className="contact-phone-status">

                                <span>
                                    9:41
                                </span>

                                <div className="contact-phone-status-icons">

                                    <span className="phone-signal">
                                        ▮▮▮
                                    </span>

                                    <span>
                                        WiFi
                                    </span>

                                    <span className="phone-battery">
                                    </span>

                                </div>

                            </div>


                            {/* DYNAMIC ISLAND */}

                            <div className="contact-phone-island">

                                <span className="contact-phone-camera">
                                </span>

                            </div>


                            {/* APP HEADER */}

                            <div className="contact-phone-app-header">

                                <span>
                                    Nabil Pharmacy
                                </span>

                                <strong>
                                    Contact
                                </strong>

                            </div>



                            {/* CONTACT PREVIEW */}

                            <div className="contact-phone-profile">

                                <div className="contact-phone-avatar">

                                    {initials}

                                </div>


                                <h3>

                                    {
                                        formData.fullName ||
                                        "Your Name"
                                    }

                                </h3>


                                <p>

                                    {
                                        formData.phone ||
                                        "Your phone number"
                                    }

                                </p>


                                <div className="contact-phone-actions">

                                    <div>

                                        <Phone
                                            size={17}
                                        />

                                        <span>
                                            call
                                        </span>

                                    </div>


                                    <div>

                                        <Mail
                                            size={17}
                                        />

                                        <span>
                                            email
                                        </span>

                                    </div>


                                    <div>

                                        <User
                                            size={17}
                                        />

                                        <span>
                                            contact
                                        </span>

                                    </div>

                                </div>

                            </div>



                            {/* PHONE FORM */}

                            <div className="contact-phone-form">


                                {/* NAME */}

                                <div className="contact-phone-field">

                                    <label htmlFor="fullName">
                                        Full Name
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
                                            placeholder="Your full name"
                                            autoComplete="name"
                                            required
                                        />

                                    </div>

                                </div>



                                {/* PHONE */}

                                <div className="contact-phone-field">

                                    <label htmlFor="phone">
                                        Phone Number
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
                                            placeholder="Phone number"
                                            autoComplete="tel"
                                            required
                                        />

                                    </div>

                                </div>



                                {/* EMAIL */}

                                <div className="contact-phone-field">

                                    <label htmlFor="email">
                                        Email
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
                                            placeholder="Email address"
                                            autoComplete="email"
                                        />

                                    </div>

                                </div>

                            </div>



                            {/* HOME INDICATOR */}

                            <div className="contact-phone-home-indicator">
                            </div>

                        </div>

                    </div>

                </div>



                {/* =========================
                    SIDE INFORMATION
                ========================= */}

                <div className="contact-phone-side">

                    <span className="section-label">
                        Live Contact Preview
                    </span>


                    <h3>
                        Your details,
                        inside your phone.
                    </h3>


                    <p>
                        The phone updates immediately
                        while you type. These details
                        will later be used for order
                        delivery and pharmacy contact.
                    </p>


                    <div className="contact-phone-side-card">

                        <User />


                        <div>

                            <span>
                                Customer
                            </span>


                            <strong>

                                {
                                    formData.fullName ||
                                    "Not entered yet"
                                }

                            </strong>

                        </div>

                    </div>


                    <div className="contact-phone-side-card">

                        <Phone />


                        <div>

                            <span>
                                Phone
                            </span>


                            <strong>

                                {
                                    formData.phone ||
                                    "Not entered yet"
                                }

                            </strong>

                        </div>

                    </div>


                    <div className="contact-phone-side-card">

                        <Mail />


                        <div>

                            <span>
                                Email
                            </span>


                            <strong>

                                {
                                    formData.email ||
                                    "Optional"
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