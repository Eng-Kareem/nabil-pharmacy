import {
    Check,
    LoaderCircle
} from "lucide-react";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import "./DoctorConfirmButton.css";


function DoctorConfirmButton({

    onClick,
    loading = false,
    success = false,
    disabled = false

}) {

    const {
        isArabic
    } = useLanguage();


    const text =
        isArabic
            ? {

                placing:
                    "جاري تنفيذ الطلب...",

                confirmed:
                    "تم تأكيد الطلب",

                confirm:
                    "تأكيد الطلب"

            }
            : {

                placing:
                    "Placing Order...",

                confirmed:
                    "Order Confirmed",

                confirm:
                    "Confirm Order"

            };


    const showDoctor =
        loading ||
        success;


    return (

        <button
            type="button"
            className={[
                "doctor-confirm-button",

                showDoctor
                    ? "doctor-visible"
                    : "",

                success
                    ? "doctor-success"
                    : ""

            ]
                .filter(
                    Boolean
                )
                .join(
                    " "
                )
            }
            onClick={
                onClick
            }
            disabled={
                disabled ||
                loading ||
                success
            }
            dir={
                isArabic
                    ? "rtl"
                    : "ltr"
            }
        >

            {/* =========================================
                DOCTOR
            ========================================= */}

            <span
                className="doctor-button-character"
                aria-hidden="true"
            >

                <span className="doctor-button-doctor">
                    👨‍⚕️
                </span>


                <span className="doctor-button-thumb">
                    👍
                </span>

            </span>


            {/* =========================================
                BUTTON TEXT
            ========================================= */}

            <span
                className="doctor-button-label"
                aria-live="polite"
            >

                {
                    loading
                        ? (

                            <>

                                <LoaderCircle
                                    size={18}
                                    className="doctor-button-spinner"
                                />

                                {
                                    text.placing
                                }

                            </>

                        )
                        : success
                            ? (

                                <>

                                    <Check
                                        size={18}
                                    />

                                    {
                                        text.confirmed
                                    }

                                </>

                            )
                            : (

                                text.confirm

                            )
                }

            </span>


            {/* =========================================
                SUCCESS DECORATIONS
            ========================================= */}

            <span
                className="doctor-button-spark doctor-spark-one"
                aria-hidden="true"
            >
                +
            </span>


            <span
                className="doctor-button-spark doctor-spark-two"
                aria-hidden="true"
            >
                +
            </span>


            <span
                className="doctor-button-spark doctor-spark-three"
                aria-hidden="true"
            >
                +
            </span>

        </button>

    );

}


export default DoctorConfirmButton;