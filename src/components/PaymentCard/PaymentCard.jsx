import {
    CreditCard,
    LockKeyhole
} from "lucide-react";

import {
    useState
} from "react";

import "./PaymentCard.css";


function PaymentCard() {

    const [cardNumber, setCardNumber] =
        useState("");

    const [cardName, setCardName] =
        useState("");

    const [expiry, setExpiry] =
        useState("");

    const [cvv, setCvv] =
        useState("");

    const [showBack, setShowBack] =
        useState(false);


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

        return limited.replace(
            /(.{4})/g,
            "$1 "
        ).trim();
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
                `${value.slice(
                    0,
                    2
                )}/${value.slice(
                    2
                )}`;
        }


        setExpiry(value);
    };


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


        setCvv(value);
    };


    const maskedCardNumber = () => {

        if (!cardNumber) {
            return (
                "•••• •••• •••• ••••"
            );
        }


        return cardNumber;
    };


    const detectCardType = () => {

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


        return "CARD";
    };


    return (
        <div className="payment-card-wrapper">


            {/* ==============================
                3D CARD
            ============================== */}

            <div
                className={
                    showBack
                        ? "payment-card-scene flipped"
                        : "payment-card-scene"
                }
            >

                <div className="payment-card-3d">


                    {/* FRONT */}

                    <div className="payment-card-face payment-card-front">

                        <div className="payment-card-pattern">
                        </div>


                        <div className="payment-card-top">

                            <div className="payment-card-brand">

                                <img
                                    src="/nabil-logo.png"
                                    alt=""
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
                                {detectCardType()}
                            </strong>

                        </div>


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


                        <div className="payment-card-number">

                            {
                                maskedCardNumber()
                            }

                        </div>


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



                    {/* BACK */}

                    <div className="payment-card-face payment-card-back">

                        <div className="payment-card-back-top">

                            <span>
                                NABIL PHARMACY
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


                        <div className="payment-card-back-text">

                            <p>

                                Payment information
                                is securely processed
                                by the payment provider.

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



            {/* ==============================
                CARD FORM
            ============================== */}

            <div className="payment-card-form">


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
                            onFocus={() =>
                                setShowBack(
                                    false
                                )
                            }
                            maxLength={19}
                        />

                    </div>

                </div>



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
                        onFocus={() =>
                            setShowBack(
                                false
                            )
                        }
                    />

                </div>



                <div className="payment-card-small-fields">

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
                            onFocus={() =>
                                setShowBack(
                                    false
                                )
                            }
                            maxLength={5}
                        />

                    </div>



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
                                onFocus={() =>
                                    setShowBack(
                                        true
                                    )
                                }
                                onBlur={() =>
                                    setShowBack(
                                        false
                                    )
                                }
                                maxLength={4}
                            />

                        </div>

                    </div>

                </div>


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