import {
    CreditCard,
    LockKeyhole
} from "lucide-react";

import {
    useState
} from "react";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import checkoutTranslations
    from "../../i18n/checkoutTranslations.js";

import "./PaymentCard.css";


function PaymentCard() {

    const {
        language,
        isArabic
    } = useLanguage();


    const text =
        checkoutTranslations[
            language
        ] ||
        checkoutTranslations.en;


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


    const [
        manualFlip,
        setManualFlip
    ] = useState(false);


    const [
        cvvFocused,
        setCvvFocused
    ] = useState(false);


    const showBack =
        manualFlip ||
        cvvFocused;


    const handleCardFlip =
        () => {

            setManualFlip(
                current =>
                    !current
            );

        };


    const handleCardKeyDown =
        event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                handleCardFlip();

            }

        };


    const formatCardNumber = (
        value
    ) => {

        const numbersOnly =
            value.replace(
                /\D/g,
                ""
            );


        return numbersOnly
            .slice(
                0,
                16
            )
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
            value.length >= 3
        ) {

            value =
                `${value.slice(0, 2)}/${value.slice(2)}`;

        }


        setExpiry(
            value
        );

    };


    const handleCvv = (
        event
    ) => {

        setCvv(
            event.target.value
                .replace(
                    /\D/g,
                    ""
                )
                .slice(
                    0,
                    4
                )
        );

    };


    const detectCardType =
        () => {

            const clean =
                cardNumber.replace(
                    /\s/g,
                    ""
                );


            if (
                clean.startsWith(
                    "4"
                )
            ) {

                return "VISA";

            }


            if (
                /^5[1-5]/.test(
                    clean
                )
            ) {

                return "MASTERCARD";

            }


            return text.genericCard;

        };


    return (

        <div className="payment-card-wrapper">


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
                        ? text.showCardFront
                        : text.showCardBack
                }

                title={
                    text.rotateCard
                }

                style={{
                    cursor:
                        "pointer"
                }}

            >

                <div className="payment-card-3d">


                    <div className="payment-card-face payment-card-front">


                        <div className="payment-card-pattern">
                        </div>


                        <div className="payment-card-top">

                            <div className="payment-card-brand">

                                <img
                                    src="/nabil-logo.png"
                                    alt={
                                        isArabic
                                            ? "صيدلية نبيل"
                                            : "Nabil Pharmacy"
                                    }
                                />


                                <div>

                                    <strong>
                                        {
                                            isArabic
                                                ? "صيدلية نبيل"
                                                : "Nabil Pharmacy"
                                        }
                                    </strong>


                                    <span>
                                        {
                                            isArabic
                                                ? "منذ عام ١٩٧٥"
                                                : "Since 1975"
                                        }
                                    </span>

                                </div>

                            </div>


                            <strong className="payment-card-network">

                                {
                                    detectCardType()
                                }

                            </strong>

                        </div>


                        <div className="payment-card-chip-row">

                            <div className="payment-card-chip">

                                <span></span>
                                <span></span>
                                <span></span>

                            </div>


                            <div className="contactless-symbol">
                                )))
                            </div>

                        </div>


                        <div
                            className="payment-card-number"
                            dir="ltr"
                        >

                            {
                                cardNumber ||
                                "•••• •••• •••• ••••"
                            }

                        </div>


                        <div className="payment-card-bottom">

                            <div>

                                <span>
                                    {text.cardHolder}
                                </span>


                                <strong>

                                    {
                                        cardName ||
                                        text.yourNameCard
                                    }

                                </strong>

                            </div>


                            <div>

                                <span>
                                    {text.expires}
                                </span>


                                <strong
                                    dir="ltr"
                                >

                                    {
                                        expiry ||
                                        text.expiryPlaceholder
                                    }

                                </strong>

                            </div>

                        </div>

                    </div>


                    <div className="payment-card-face payment-card-back">


                        <div className="payment-card-back-top">

                            <span>

                                {
                                    isArabic
                                        ? "صيدلية نبيل"
                                        : "NABIL PHARMACY"
                                }

                            </span>


                            <LockKeyhole
                                size={17}
                            />

                        </div>


                        <div className="payment-card-magnetic-strip">
                        </div>


                        <div className="payment-card-signature">

                            <div>

                                <span>
                                    {text.authorizedSignature}
                                </span>


                                <div className="signature-lines">
                                </div>

                            </div>


                            <strong
                                dir="ltr"
                            >

                                {
                                    cvv ||
                                    (
                                        isArabic
                                            ? "رمز الأمان"
                                            : "CVV"
                                    )
                                }

                            </strong>

                        </div>


                        <div className="payment-card-back-text">

                            <p>
                                {text.cardBackDescription}
                            </p>


                            <div className="payment-card-back-logo">

                                <CreditCard
                                    size={26}
                                />


                                <span>
                                    {text.secure}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


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

                    {
                        text.clickCard
                    }

                </span>

                {" "}

                {
                    text.viewOtherSide
                }

            </div>


            <div className="payment-card-form">


                <div className="payment-card-field payment-card-field-full">

                    <label htmlFor="cardNumber">
                        {text.cardNumber}
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
                            dir="ltr"
                        />

                    </div>

                </div>


                <div className="payment-card-field payment-card-field-full">

                    <label htmlFor="cardName">
                        {text.cardholderName}
                    </label>


                    <input
                        id="cardName"
                        type="text"
                        autoComplete="cc-name"
                        placeholder={
                            text.nameOnCard
                        }
                        value={
                            cardName
                        }
                        onChange={
                            event =>
                                setCardName(
                                    event.target.value
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


                <div className="payment-card-small-fields">


                    <div className="payment-card-field">

                        <label htmlFor="cardExpiry">
                            {text.expiryDate}
                        </label>


                        <input
                            id="cardExpiry"
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            placeholder={
                                text.expiryPlaceholder
                            }
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
                            dir="ltr"
                        />

                    </div>


                    <div className="payment-card-field">

                        <label htmlFor="cardCvv">
                            {text.securityCode}
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
                                onFocus={() =>
                                    setCvvFocused(
                                        true
                                    )
                                }
                                onBlur={() =>
                                    setCvvFocused(
                                        false
                                    )
                                }
                                maxLength={4}
                                dir="ltr"
                            />

                        </div>

                    </div>

                </div>


                <div className="payment-card-security-message">

                    <LockKeyhole
                        size={17}
                    />


                    <span>
                        {text.cardInformationSecurity}
                    </span>

                </div>

            </div>

        </div>

    );

}


export default PaymentCard;