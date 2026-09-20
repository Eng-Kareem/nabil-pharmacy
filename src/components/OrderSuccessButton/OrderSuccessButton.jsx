import { useEffect, useState } from "react";
import "./OrderSuccessButton.css";

export default function OrderSuccessButton({
    isSubmitting = false,
    isSuccess = false,
    onClick,
    disabled = false,
    error = ""
}) {
    const [stage, setStage] = useState("idle");
    // stages:
    // idle -> loading -> doctor -> car -> done

    useEffect(() => {
        let timer1;
        let timer2;
        let timer3;

        if (isSubmitting) {
            setStage("loading");
        }

        if (isSuccess) {
            setStage("doctor");

            timer1 = setTimeout(() => {
                setStage("car");
            }, 1800);

            timer2 = setTimeout(() => {
                setStage("done");
            }, 3800);
        }

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [isSubmitting, isSuccess]);

    const buttonDisabled =
        disabled || isSubmitting || isSuccess;

    return (
        <div className="order-success-button-wrap">
            <button
                type="button"
                className={`order-success-button ${
                    stage === "doctor" ? "show-doctor" : ""
                } ${stage === "car" ? "show-car" : ""} ${
                    stage === "done" ? "show-done" : ""
                }`}
                onClick={onClick}
                disabled={buttonDisabled}
            >
                {stage === "idle" && (
                    <span className="order-success-button__label">
                        Confirm Order
                    </span>
                )}

                {stage === "loading" && (
                    <span className="order-success-button__label order-success-button__loading">
                        <span className="order-success-spinner"></span>
                        Processing...
                    </span>
                )}

                {stage === "doctor" && (
                    <div className="order-scene order-scene--doctor">
                        <div className="doctor-character">
                            <div className="doctor-face">
                                <span className="doctor-eye left"></span>
                                <span className="doctor-eye right"></span>
                                <span className="doctor-smile"></span>
                            </div>

                            <div className="doctor-hair"></div>

                            <div className="doctor-body">
                                <div className="doctor-coat"></div>
                                <div className="doctor-stethoscope"></div>
                            </div>

                            <div className="doctor-arm doctor-arm-left"></div>
                            <div className="doctor-arm doctor-arm-right thumbs-up-arm">
                                <span className="thumb-shape"></span>
                            </div>
                        </div>

                        <div className="doctor-message">
                            Doctor approved!
                        </div>
                    </div>
                )}

                {stage === "car" && (
                    <div className="order-scene order-scene--car">
                        <div className="road-line"></div>

                        <div className="delivery-car">
                            <div className="delivery-car__top"></div>
                            <div className="delivery-car__body">
                                <span className="delivery-car__window"></span>
                                <span className="delivery-car__cross">+</span>
                            </div>
                            <div className="delivery-wheel wheel-left"></div>
                            <div className="delivery-wheel wheel-right"></div>
                        </div>

                        <div className="car-message">
                            On the way!
                        </div>
                    </div>
                )}

                {stage === "done" && (
                    <span className="order-success-button__label">
                        Order Confirmed
                    </span>
                )}
            </button>

            {error ? (
                <p className="order-success-button__error">
                    {error}
                </p>
            ) : null}
        </div>
    );
}