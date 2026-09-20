import {
    Check,
    LoaderCircle
} from "lucide-react";

import "./DoctorConfirmButton.css";


function DoctorConfirmButton({

    onClick,
    loading = false,
    success = false,
    disabled = false

}) {

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
                .filter(Boolean)
                .join(" ")
            }
            onClick={
                onClick
            }
            disabled={
                disabled ||
                loading ||
                success
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

                                Placing Order...
                            </>
                        )
                        : success
                            ? (
                                <>
                                    <Check
                                        size={18}
                                    />

                                    Order Confirmed
                                </>
                            )
                            : (
                                "Confirm Order"
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