import {
    CreditCard,
    LockKeyhole
} from "lucide-react";

import {
    useState
} from "react";

import "./PaymentCard.css";


function PaymentCard() {

    const [
        cardNumber,
        setCardNumber
    ] = useState("");


    const [
        cardName,
        setCardName
    ] = useState("");


    const [
        expiry,
        setExpiry
    ] = useState("");


    const [
        cvv,
        setCvv
    ] = useState("");


    /*
    ========================================================
    CARD FLIP STATES
    ========================================================

    manualFlip:
    User clicks/taps the card.

    cvvFocused:
    Automatically flips while typing CVV.
    */

    const [
        manualFlip,
        setManualFlip
    ] = useState(false);


    const [
        cvvFocused,
        setCvvFocused
    ] = useState(false);


    /*
    Card shows the back when either:
    - user manually flipped it
    - CVV input is focused
    */

    const showBack =
        manualFlip ||
        cvvFocused;


    /*
    ========================================================
    MANUAL CARD FLIP
    ========================================================
    */

    const handleCardFlip =
        () => {

            setManualFlip(
                current =>
                    !current
            );

        };


    /*
    ========================================================
    KEYBOARD CARD FLIP
    ========================================================
    */

    const handleCardKeyDown =
        event => {

            if (
                event.key ===
                    "Enter" ||
                event.key ===
                    " "
            ) {

                event.preventDefault();


                handleCardFlip();

            }

        };


    /*
    ========================================================
    CARD NUMBER
    ========================================================
    */

    const formatCardNumber = (
        value
    ) => {

        const numbersOnly =
            value.replace(
                /\D/g,
                ""
            );


        const limited =
            numbersOnly.slice(
                0,
                16
            );


        return limited
            .replace(
                /(.{4})/g,
                "$1 "
            )
            .trim();

    };


    const handleCardNumber = (
        event
    ) => {

        setCardNumber(
            formatCardNumber(
                event.target.value
            )
        );

    };


    /*
    ========================================================
    EXPIRY
    ========================================================
    */

    const handleExpiry = (
        event
    ) => {

        let value =
            event.target.value
                .replace(
                    /\D/g,
                    ""
                )
                .slice(
                    0,
                    4
                );


        if (
            value.length >=
            3
        ) {

            value =
                `${value.slice(
                    0,
                    2
                )}/${value.slice(
                    2
                )}`;

        }


        setExpiry(
            value
        );

    };


    /*
    ========================================================
    CVV
    ========================================================
    */

    const handleCvv = (
        event
    ) => {

        const value =
            event.target.value
                .replace(
                    /\D/g,
                    ""
                )
                .slice(
                    0,
                    4
                );


        setCvv(
            value
        );

    };


    /*
    ========================================================
    DISPLAY CARD NUMBER
    ========================================================
    */

    const maskedCardNumber =
        () => {

            if (
                !cardNumber
            ) {

                return (
                    "•••• •••• •••• ••••"
                );

            }


            return cardNumber;

        };


    /*
    ========================================================
    DETECT CARD TYPE
    ========================================================
    */

    const detectCardType =
        () => {

            const clean =
                cardNumber.replace(
                    /\s/g,
                    ""
                );


            /*
            VISA
            */

            if (
                clean.startsWith(
                    "4"
                )
            ) {

                return "VISA";

            }


            /*
            MASTERCARD
            */

            if (
                /^5[1-5]/.test(
                    clean
                )
            ) {

                return "MASTERCARD";

            }


            return "CARD";

        };


    return (

        <div className="payment-card-wrapper">


            {/* =========================================
                3D INTERACTIVE CARD
            ========================================= */}

            <div

                className={
                    showBack
                        ? "payment-card-scene flipped"
                        : "payment-card-scene"
                }

                onClick={
                    handleCardFlip
                }

                onKeyDown={
                    handleCardKeyDown
                }

                role="button"

                tabIndex={0}

                aria-pressed={
                    showBack
                }

                aria-label={
                    showBack
                        ? "Show front of payment card"
                        : "Show back of payment card"
                }

                title="Click or tap the card to rotate it"

                style={{
                    cursor:
                        "pointer"
                }}

            >

                <div className="payment-card-3d">


                    {/* =====================================
                        FRONT
                    ===================================== */}

                    <div className="payment-card-face payment-card-front">


                        <div className="payment-card-pattern">
                        </div>


                        {/* =================================
                            TOP BRAND
                        ================================= */}

                        <div className="payment-card-top">


                            <div className="payment-card-brand">

                                <img
                                    src="/nabil-logo.png"
                                    alt="Nabil Pharmacy"
                                />


                                <div>

                                    <strong>
                                        Nabil Pharmacy
                                    </strong>


                                    <span>
                                        Since 1975
                                    </span>

                                </div>

                            </div>


                            <strong className="payment-card-network">

                                {
                                    detectCardType()
                                }

                            </strong>

                        </div>


                        {/* =================================
                            CHIP
                        ================================= */}

                        <div className="payment-card-chip-row">


                            <div className="payment-card-chip">

                                <span>
                                </span>

                                <span>
                                </span>

                                <span>
                                </span>

                            </div>


                            <div className="contactless-symbol">

                                )))

                            </div>

                        </div>


                        {/* =================================
                            CARD NUMBER
                        ================================= */}

                        <div className="payment-card-number">

                            {
                                maskedCardNumber()
                            }

                        </div>


                        {/* =================================
                            CARD BOTTOM
                        ================================= */}

                        <div className="payment-card-bottom">


                            <div>

                                <span>
                                    CARD HOLDER
                                </span>


                                <strong>

                                    {
                                        cardName ||
                                        "YOUR NAME"
                                    }

                                </strong>

                            </div>


                            <div>

                                <span>
                                    EXPIRES
                                </span>


                                <strong>

                                    {
                                        expiry ||
                                        "MM/YY"
                                    }

                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* =====================================
                        BACK
                    ===================================== */}

                    <div className="payment-card-face payment-card-back">


                        <div className="payment-card-back-top">

                            <span>
                                NABIL PHARMACY
                            </span>


                            <LockKeyhole
                                size={17}
                            />

                        </div>


                        {/* =================================
                            MAGNETIC STRIP
                        ================================= */}

                        <div className="payment-card-magnetic-strip">
                        </div>


                        {/* =================================
                            SIGNATURE + CVV
                        ================================= */}

                        <div className="payment-card-signature">


                            <div>

                                <span>
                                    AUTHORIZED SIGNATURE
                                </span>


                                <div className="signature-lines">
                                </div>

                            </div>


                            <strong>

                                {
                                    cvv
                                        ? cvv
                                        : "CVV"
                                }

                            </strong>

                        </div>


                        {/* =================================
                            BACK TEXT
                        ================================= */}

                        <div className="payment-card-back-text">


                            <p>

                                Interactive payment
                                preview for Nabil
                                Pharmacy.

                                <br />

                                Card information is
                                not saved anywhere.

                            </p>


                            <div className="payment-card-back-logo">

                                <CreditCard
                                    size={26}
                                />


                                <span>
                                    SECURE
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* =========================================
                SMALL INTERACTION MESSAGE
            ========================================= */}

            <div
                style={{
                    textAlign:
                        "center",

                    margin:
                        "-18px 0 25px",

                    fontSize:
                        "0.74rem",

                    fontWeight:
                        "700",

                    color:
                        "var(--muted)"
                }}
            >

                <span
                    style={{
                        color:
                            "var(--red)"
                    }}
                >
                    Click or tap the card
                </span>

                {" "}to view the other side.

            </div>


            {/* =========================================
                CARD FORM
            ========================================= */}

            <div className="payment-card-form">


                {/* =====================================
                    CARD NUMBER
                ===================================== */}

                <div className="payment-card-field payment-card-field-full">


                    <label htmlFor="cardNumber">
                        Card Number
                    </label>


                    <div className="payment-input-wrapper">


                        <CreditCard
                            size={18}
                        />


                        <input

                            id="cardNumber"

                            type="text"

                            inputMode="numeric"

                            autoComplete="cc-number"

                            placeholder="1234 5678 9012 3456"

                            value={
                                cardNumber
                            }

                            onChange={
                                handleCardNumber
                            }

                            onFocus={() => {

                                setCvvFocused(
                                    false
                                );


                                setManualFlip(
                                    false
                                );

                            }}

                            maxLength={19}

                        />

                    </div>

                </div>


                {/* =====================================
                    CARDHOLDER NAME
                ===================================== */}

                <div className="payment-card-field payment-card-field-full">


                    <label htmlFor="cardName">
                        Cardholder Name
                    </label>


                    <input

                        id="cardName"

                        type="text"

                        autoComplete="cc-name"

                        placeholder="Name on card"

                        value={
                            cardName
                        }

                        onChange={
                            event =>
                                setCardName(

                                    event
                                        .target
                                        .value
                                        .toUpperCase()
                                        .slice(
                                            0,
                                            30
                                        )

                                )
                        }

                        onFocus={() => {

                            setCvvFocused(
                                false
                            );


                            setManualFlip(
                                false
                            );

                        }}

                    />

                </div>


                {/* =====================================
                    EXPIRY + CVV
                ===================================== */}

                <div className="payment-card-small-fields">


                    {/* EXPIRY */}

                    <div className="payment-card-field">


                        <label htmlFor="cardExpiry">
                            Expiry Date
                        </label>


                        <input

                            id="cardExpiry"

                            type="text"

                            inputMode="numeric"

                            autoComplete="cc-exp"

                            placeholder="MM/YY"

                            value={
                                expiry
                            }

                            onChange={
                                handleExpiry
                            }

                            onFocus={() => {

                                setCvvFocused(
                                    false
                                );


                                setManualFlip(
                                    false
                                );

                            }}

                            maxLength={5}

                        />

                    </div>


                    {/* CVV */}

                    <div className="payment-card-field">


                        <label htmlFor="cardCvv">
                            CVV
                        </label>


                        <div className="payment-input-wrapper">


                            <LockKeyhole
                                size={17}
                            />


                            <input

                                id="cardCvv"

                                type="password"

                                inputMode="numeric"

                                autoComplete="cc-csc"

                                placeholder="•••"

                                value={
                                    cvv
                                }

                                onChange={
                                    handleCvv
                                }

                                onFocus={() => {

                                    setCvvFocused(
                                        true
                                    );

                                }}

                                onBlur={() => {

                                    setCvvFocused(
                                        false
                                    );

                                }}

                                maxLength={4}

                            />

                        </div>

                    </div>

                </div>


                {/* =====================================
                    SECURITY MESSAGE
                ===================================== */}

                <div className="payment-card-security-message">


                    <LockKeyhole
                        size={17}
                    />


                    <span>

                        Card information is currently
                        used only for the interactive
                        checkout preview and is not
                        saved anywhere.

                    </span>

                </div>

            </div>

        </div>

    );

}


export default PaymentCard;