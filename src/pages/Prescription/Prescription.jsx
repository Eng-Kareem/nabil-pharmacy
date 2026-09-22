import {
    CheckCircle2,
    FileText,
    LockKeyhole,
    ShieldCheck,
    Upload,
    X
} from "lucide-react";

import {
    AnimatePresence,
    motion,
    useReducedMotion
} from "framer-motion";

import {
    useRef,
    useState
} from "react";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import customerTranslations
    from "../../i18n/customerTranslations.js";

import "./Prescription.css";


function Prescription() {

    const {
        language,
        isArabic
    } =
        useLanguage();


    const text =
        customerTranslations[
            language
        ] ||
        customerTranslations.en;


    const inputRef =
        useRef(
            null
        );


    const reducedMotion =
        useReducedMotion();


    const [
        file,
        setFile
    ] =
        useState(
            null
        );


    const [
        submitted,
        setSubmitted
    ] =
        useState(
            false
        );


    const [
        dragActive,
        setDragActive
    ] =
        useState(
            false
        );


    const handleSelectedFile = (
        selectedFile
    ) => {

        if (
            !selectedFile
        ) {

            return;

        }


        setFile(
            selectedFile
        );


        setSubmitted(
            false
        );

    };


    const handleInputChange = (
        event
    ) => {

        handleSelectedFile(
            event.target.files?.[0]
        );

    };


    const handleDragOver = (
        event
    ) => {

        event.preventDefault();


        setDragActive(
            true
        );

    };


    const handleDragLeave =
        () => {

            setDragActive(
                false
            );

        };


    const handleDrop = (
        event
    ) => {

        event.preventDefault();


        setDragActive(
            false
        );


        handleSelectedFile(
            event.dataTransfer
                .files?.[0]
        );

    };


    const handleSubmit = (
        event
    ) => {

        event.preventDefault();


        setSubmitted(
            true
        );

    };


    const removeFile = (
        event
    ) => {

        event.stopPropagation();


        setFile(
            null
        );


        setSubmitted(
            false
        );


        if (
            inputRef.current
        ) {

            inputRef.current.value =
                "";

        }

    };


    return (

        <main className="prescription-page">


            <div className="prescription-page-pattern">
            </div>


            <div className="container prescription-page-grid">


                {/* =============================================
                    INTRO
                ============================================= */}

                <motion.section

                    className="prescription-page-copy"

                    initial={{
                        opacity: 0,

                        x:
                            reducedMotion
                                ? 0
                                : (
                                    isArabic
                                        ? 35
                                        : -35
                                )
                    }}

                    animate={{
                        opacity: 1,
                        x: 0
                    }}

                    transition={{
                        duration:
                            reducedMotion
                                ? 0
                                : 0.7
                    }}

                >

                    <span className="section-label">

                        {
                            text.prescriptionService
                        }

                    </span>


                    <h1>

                        {
                            text.sendYour
                        }

                        <span>

                            {" "}

                            {
                                text.prescription
                            }

                            {" "}

                        </span>

                        {
                            text.online
                        }

                    </h1>


                    <p>

                        {
                            text.prescriptionDescription
                        }

                    </p>


                    <div className="prescription-security-list">


                        <div>

                            <ShieldCheck />


                            <span>

                                <strong>

                                    {
                                        text.secureArchitecture
                                    }

                                </strong>


                                {
                                    text.secureArchitectureDescription
                                }

                            </span>

                        </div>


                        <div>

                            <LockKeyhole />


                            <span>

                                <strong>

                                    {
                                        text.privateAccess
                                    }

                                </strong>


                                {
                                    text.privateAccessDescription
                                }

                            </span>

                        </div>


                        <div>

                            <FileText />


                            <span>

                                <strong>

                                    {
                                        text.pharmacyReview
                                    }

                                </strong>


                                {
                                    text.pharmacyReviewDescription
                                }

                            </span>

                        </div>

                    </div>

                </motion.section>


                {/* =============================================
                    FORM
                ============================================= */}

                <motion.form

                    className="prescription-form-card"

                    onSubmit={
                        handleSubmit
                    }

                    initial={{
                        opacity: 0,

                        y:
                            reducedMotion
                                ? 0
                                : 35
                    }}

                    animate={{
                        opacity: 1,
                        y: 0
                    }}

                    transition={{
                        duration:
                            reducedMotion
                                ? 0
                                : 0.7,

                        delay:
                            reducedMotion
                                ? 0
                                : 0.1
                    }}

                >

                    <div className="prescription-form-heading">

                        <span>

                            {
                                text.prescriptionRequest
                            }

                        </span>


                        <h2>

                            {
                                text.yourDetails
                            }

                        </h2>

                    </div>


                    {/* NAME */}

                    <div className="prescription-form-group">

                        <label htmlFor="patientName">

                            {
                                text.fullNamePrescription
                            }

                        </label>


                        <input
                            id="patientName"
                            type="text"
                            placeholder={
                                text.enterFullNamePrescription
                            }
                            required
                        />

                    </div>


                    {/* PHONE */}

                    <div className="prescription-form-group">

                        <label htmlFor="patientPhone">

                            {
                                text.phoneNumber
                            }

                        </label>


                        <input
                            id="patientPhone"
                            type="tel"
                            placeholder={
                                text.enterPhoneNumber
                            }
                            dir="ltr"
                            required
                        />

                    </div>


                    {/* FILE */}

                    <div className="prescription-form-group">

                        <label>

                            {
                                text.prescriptionFile
                            }

                        </label>


                        <motion.button

                            type="button"

                            className={
                                dragActive
                                    ? "prescription-upload-zone active"
                                    : "prescription-upload-zone"
                            }

                            onClick={() =>
                                inputRef.current
                                    ?.click()
                            }

                            onDragOver={
                                handleDragOver
                            }

                            onDragLeave={
                                handleDragLeave
                            }

                            onDrop={
                                handleDrop
                            }

                            whileHover={{
                                scale: 1.01
                            }}

                        >

                            {
                                !file
                                    ? (

                                        <>

                                            <div className="upload-icon-circle">

                                                <Upload
                                                    size={30}
                                                />

                                            </div>


                                            <strong>

                                                {
                                                    text.uploadPrescription
                                                }

                                            </strong>


                                            <span>

                                                {
                                                    text.clickDragFile
                                                }

                                            </span>


                                            <small>

                                                {
                                                    text.acceptedFiles
                                                }

                                            </small>

                                        </>

                                    )
                                    : (

                                        <div className="selected-prescription-file">

                                            <FileText />


                                            <div>

                                                <strong
                                                    dir="auto"
                                                >

                                                    {
                                                        file.name
                                                    }

                                                </strong>


                                                <span>

                                                    {
                                                        text.fileSelected
                                                    }

                                                </span>

                                            </div>


                                            <button
                                                type="button"
                                                onClick={
                                                    removeFile
                                                }
                                                aria-label={
                                                    text.removeSelectedFile
                                                }
                                            >

                                                <X
                                                    size={18}
                                                />

                                            </button>

                                        </div>

                                    )
                            }

                        </motion.button>


                        <input
                            ref={
                                inputRef
                            }
                            className="prescription-hidden-file"
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            onChange={
                                handleInputChange
                            }
                        />

                    </div>


                    {/* SUBMIT */}

                    <button
                        type="submit"
                        className="primary-button prescription-submit"
                        disabled={
                            !file
                        }
                    >

                        <Upload
                            size={19}
                        />

                        {
                            text.submitPrescription
                        }

                    </button>


                    <AnimatePresence>

                        {
                            submitted && (

                                <motion.div

                                    className="prescription-demo-message"

                                    initial={{
                                        opacity: 0,
                                        y: 10
                                    }}

                                    animate={{
                                        opacity: 1,
                                        y: 0
                                    }}

                                    exit={{
                                        opacity: 0
                                    }}

                                >

                                    <CheckCircle2 />


                                    <div>

                                        <strong>

                                            {
                                                text.frontendSuccess
                                            }

                                        </strong>


                                        <span>

                                            {
                                                text.nothingUploaded
                                            }

                                        </span>

                                    </div>

                                </motion.div>

                            )
                        }

                    </AnimatePresence>

                </motion.form>

            </div>

        </main>

    );

}


export default Prescription;