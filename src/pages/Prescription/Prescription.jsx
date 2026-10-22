import {
    AlertTriangle,
    CheckCircle2,
    FileText,
    LockKeyhole,
    RefreshCw,
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
    useEffect,
    useRef,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import {
    useAuth
} from "../../context/AuthContext.jsx";

import {
    supabase
} from "../../lib/supabase.js";

import customerTranslations
    from "../../i18n/customerTranslations.js";

import "./Prescription.css";


const MAX_FILE_SIZE =
    10 * 1024 * 1024;


const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "application/pdf"
];


function Prescription() {

    const {
        language,
        isArabic
    } =
        useLanguage();


    const {
        user,
        authLoading
    } =
        useAuth();


    const text =
        customerTranslations[
            language
        ] ||
        customerTranslations.en;


    const flowText =
        isArabic
            ? {
                loadingAccount:
                    "جاري تحميل الحساب...",

                signInRequired:
                    "يجب تسجيل الدخول",

                signInDescription:
                    "للحفاظ على خصوصية الروشتة، يجب تسجيل الدخول قبل رفع أي ملف.",

                signIn:
                    "تسجيل الدخول",

                invalidType:
                    "يُسمح فقط بملفات JPG وPNG وPDF.",

                fileTooLarge:
                    "يجب ألا يزيد حجم الملف عن 10 ميجابايت.",

                uploadFailed:
                    "تعذر إرسال الروشتة. حاول مرة أخرى.",

                submitting:
                    "جاري إرسال الروشتة...",

                successTitle:
                    "تم إرسال الروشتة بنجاح",

                successText:
                    "تم إرسال الروشتة إلى فريق الصيدلية للمراجعة.",

                requestNumber:
                    "رقم الطلب",

                privateUpload:
                    "سيتم حفظ الملف بشكل خاص وآمن.",

                profileLoadError:
                    "تعذر تحميل بيانات الحساب."
            }
            : {
                loadingAccount:
                    "Loading your account...",

                signInRequired:
                    "Sign in required",

                signInDescription:
                    "To protect your prescription and personal information, you must sign in before uploading a prescription.",

                signIn:
                    "Sign In",

                invalidType:
                    "Only JPG, PNG and PDF files are accepted.",

                fileTooLarge:
                    "The prescription file must be smaller than 10 MB.",

                uploadFailed:
                    "Could not submit your prescription. Please try again.",

                submitting:
                    "Submitting Prescription...",

                successTitle:
                    "Prescription submitted successfully",

                successText:
                    "Your prescription has been securely sent to the pharmacy team for review.",

                requestNumber:
                    "Request",

                privateUpload:
                    "Your file will be stored privately and securely.",

                profileLoadError:
                    "Could not load your account details."
            };


    const inputRef =
        useRef(
            null
        );


    const reducedMotion =
        useReducedMotion();


    const [
        patientName,
        setPatientName
    ] =
        useState(
            ""
        );


    const [
        patientPhone,
        setPatientPhone
    ] =
        useState(
            ""
        );


    const [
        profileLoading,
        setProfileLoading
    ] =
        useState(
            false
        );


    const [
        file,
        setFile
    ] =
        useState(
            null
        );


    const [
        dragActive,
        setDragActive
    ] =
        useState(
            false
        );


    const [
        uploading,
        setUploading
    ] =
        useState(
            false
        );


    const [
        error,
        setError
    ] =
        useState(
            ""
        );


    const [
        submittedRequest,
        setSubmittedRequest
    ] =
        useState(
            null
        );


    /*
    ========================================================
    LOAD CUSTOMER PROFILE
    ========================================================
    */

    useEffect(
        () => {

            let active =
                true;


            const loadProfile =
                async () => {

                    if (
                        !user?.id
                    ) {

                        setPatientName(
                            ""
                        );


                        setPatientPhone(
                            ""
                        );


                        return;

                    }


                    setProfileLoading(
                        true
                    );


                    try {

                        const {
                            data,
                            error:
                                profileError
                        } =
                            await supabase
                                .from(
                                    "profiles"
                                )
                                .select(`
                                    full_name,
                                    phone
                                `)
                                .eq(
                                    "id",
                                    user.id
                                )
                                .maybeSingle();


                        if (
                            profileError
                        ) {

                            throw profileError;

                        }


                        if (
                            !active
                        ) {

                            return;

                        }


                        setPatientName(
                            data?.full_name ||
                            user
                                ?.user_metadata
                                ?.full_name ||
                            ""
                        );


                        setPatientPhone(
                            data?.phone ||
                            ""
                        );

                    } catch (
                        profileError
                    ) {

                        console.error(
                            "Prescription profile error:",
                            profileError
                        );


                        if (
                            active
                        ) {

                            setError(
                                flowText
                                    .profileLoadError
                            );

                        }

                    } finally {

                        if (
                            active
                        ) {

                            setProfileLoading(
                                false
                            );

                        }

                    }

                };


            loadProfile();


            return () => {

                active =
                    false;

            };

        },
        [
            user?.id,
            isArabic
        ]
    );


    /*
    ========================================================
    FILE EXTENSION
    ========================================================
    */

    const fileExtension = (
        fileName
    ) => {

        const parts =
            String(
                fileName ||
                ""
            )
                .toLowerCase()
                .split(
                    "."
                );


        if (
            parts.length <
            2
        ) {

            return "";

        }


        return parts[
            parts.length - 1
        ];

    };


    /*
    ========================================================
    CONTENT TYPE
    ========================================================
    */

    const getContentType = (
        selectedFile
    ) => {

        if (
            ALLOWED_TYPES.includes(
                selectedFile.type
            )
        ) {

            return selectedFile.type;

        }


        const extension =
            fileExtension(
                selectedFile.name
            );


        switch (
            extension
        ) {

            case "jpg":

            case "jpeg":

                return "image/jpeg";


            case "png":

                return "image/png";


            case "pdf":

                return "application/pdf";


            default:

                return "";

        }

    };


    /*
    ========================================================
    SAFE FILE NAME
    ========================================================
    */

    const safeFileName = (
        fileName
    ) => {

        const clean =
            String(
                fileName ||
                "prescription"
            )
                .trim()
                .replace(
                    /[^A-Za-z0-9._-]/g,
                    "_"
                );


        return (
            clean ||
            "prescription"
        );

    };


    /*
    ========================================================
    SELECT FILE
    ========================================================
    */

    const handleSelectedFile = (
        selectedFile
    ) => {

        if (
            !selectedFile
        ) {

            return;

        }


        setError(
            ""
        );


        setSubmittedRequest(
            null
        );


        const contentType =
            getContentType(
                selectedFile
            );


        if (
            !contentType
        ) {

            setFile(
                null
            );


            setError(
                flowText.invalidType
            );


            if (
                inputRef.current
            ) {

                inputRef.current.value =
                    "";

            }


            return;

        }


        if (
            selectedFile.size >
            MAX_FILE_SIZE
        ) {

            setFile(
                null
            );


            setError(
                flowText.fileTooLarge
            );


            if (
                inputRef.current
            ) {

                inputRef.current.value =
                    "";

            }


            return;

        }


        setFile(
            selectedFile
        );

    };


    /*
    ========================================================
    INPUT FILE
    ========================================================
    */

    const handleInputChange = (
        event
    ) => {

        handleSelectedFile(
            event.target.files?.[0]
        );

    };


    /*
    ========================================================
    DRAG
    ========================================================
    */

    const handleDragOver = (
        event
    ) => {

        event.preventDefault();


        if (
            uploading
        ) {

            return;

        }


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


        if (
            uploading
        ) {

            return;

        }


        handleSelectedFile(
            event.dataTransfer
                .files?.[0]
        );

    };


    /*
    ========================================================
    REMOVE FILE
    ========================================================
    */

    const removeFile = (
        event
    ) => {

        event.stopPropagation();


        if (
            uploading
        ) {

            return;

        }


        setFile(
            null
        );


        setSubmittedRequest(
            null
        );


        setError(
            ""
        );


        if (
            inputRef.current
        ) {

            inputRef.current.value =
                "";

        }

    };


    /*
    ========================================================
    SUBMIT
    ========================================================
    */

    const handleSubmit =
        async (
            event
        ) => {

            event.preventDefault();


            if (
                !user?.id ||
                !file ||
                uploading
            ) {

                return;

            }


            const cleanName =
                patientName.trim();


            const cleanPhone =
                patientPhone.trim();


            if (
                !cleanName ||
                !cleanPhone
            ) {

                return;

            }


            setUploading(
                true
            );


            setError(
                ""
            );


            setSubmittedRequest(
                null
            );


            let uploadedPath =
                "";


            try {

                const contentType =
                    getContentType(
                        file
                    );


                if (
                    !contentType
                ) {

                    throw new Error(
                        flowText.invalidType
                    );

                }


                const path =
                    `${user.id}/${Date.now()}-${safeFileName(
                        file.name
                    )}`;


                uploadedPath =
                    path;


                const {
                    error:
                        uploadError
                } =
                    await supabase
                        .storage
                        .from(
                            "prescriptions"
                        )
                        .upload(
                            path,
                            file,
                            {
                                cacheControl:
                                    "3600",

                                upsert:
                                    false,

                                contentType
                            }
                        );


                if (
                    uploadError
                ) {

                    throw uploadError;

                }


                const {
                    data:
                        request,
                    error:
                        requestError
                } =
                    await supabase
                        .from(
                            "prescription_requests"
                        )
                        .insert({

                            user_id:
                                user.id,

                            full_name:
                                cleanName,

                            phone:
                                cleanPhone,

                            file_path:
                                path,

                            original_file_name:
                                file.name,

                            content_type:
                                contentType,

                            status:
                                "pending"

                        })
                        .select(`
                            id,
                            status,
                            created_at
                        `)
                        .single();


                if (
                    requestError
                ) {

                    throw requestError;

                }


                setSubmittedRequest(
                    request
                );


                setFile(
                    null
                );


                if (
                    inputRef.current
                ) {

                    inputRef.current.value =
                        "";

                }

            } catch (
                submitError
            ) {

                console.error(
                    "Prescription submission error:",
                    submitError
                );


                /*
                ============================================
                REMOVE ORPHANED PRIVATE FILE
                ============================================
                */

                if (
                    uploadedPath
                ) {

                    try {

                        await supabase
                            .storage
                            .from(
                                "prescriptions"
                            )
                            .remove([
                                uploadedPath
                            ]);

                    } catch (
                        cleanupError
                    ) {

                        console.error(
                            "Prescription cleanup error:",
                            cleanupError
                        );

                    }

                }


                setError(
                    submitError?.message ||
                    flowText.uploadFailed
                );

            } finally {

                setUploading(
                    false
                );

            }

        };


    /*
    ========================================================
    REQUEST NUMBER
    ========================================================
    */

    const requestNumber =
        submittedRequest?.id
            ? submittedRequest
                .id
                .slice(
                    0,
                    8
                )
                .toUpperCase()
            : "";


    /*
    ========================================================
    PAGE
    ========================================================
    */

    return (

        <main className="prescription-page">


            <div className="prescription-page-pattern">
            </div>


            <div className="container prescription-page-grid">


                {/* =========================================
                    INTRO
                ========================================= */}

                <motion.section
                    className="prescription-page-copy"
                    initial={{
                        opacity:
                            0,

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
                        opacity:
                            1,

                        x:
                            0
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


                {/* =========================================
                    AUTH LOADING
                ========================================= */}

                {
                    authLoading
                        ? (

                            <motion.div
                                className="prescription-auth-card"
                                initial={{
                                    opacity:
                                        0,

                                    y:
                                        25
                                }}
                                animate={{
                                    opacity:
                                        1,

                                    y:
                                        0
                                }}
                            >

                                <RefreshCw
                                    className="prescription-spinner"
                                    size={32}
                                />


                                <strong>

                                    {
                                        flowText.loadingAccount
                                    }

                                </strong>

                            </motion.div>

                        )
                        : !user
                            ? (

                                /* =================================
                                   SIGN IN REQUIRED
                                ================================= */

                                <motion.div
                                    className="prescription-auth-card"
                                    initial={{
                                        opacity:
                                            0,

                                        y:
                                            reducedMotion
                                                ? 0
                                                : 35
                                    }}
                                    animate={{
                                        opacity:
                                            1,

                                        y:
                                            0
                                    }}
                                    transition={{
                                        duration:
                                            reducedMotion
                                                ? 0
                                                : 0.6
                                    }}
                                >

                                    <div className="prescription-auth-icon">

                                        <LockKeyhole
                                            size={30}
                                        />

                                    </div>


                                    <h2>

                                        {
                                            flowText.signInRequired
                                        }

                                    </h2>


                                    <p>

                                        {
                                            flowText.signInDescription
                                        }

                                    </p>


                                    <Link
                                        to="/account"
                                        className="primary-button prescription-login-button"
                                    >

                                        {
                                            flowText.signIn
                                        }

                                    </Link>

                                </motion.div>

                            )
                            : (

                                /* =================================
                                   REAL PRESCRIPTION FORM
                                ================================= */

                                <motion.form
                                    className="prescription-form-card"
                                    onSubmit={
                                        handleSubmit
                                    }
                                    initial={{
                                        opacity:
                                            0,

                                        y:
                                            reducedMotion
                                                ? 0
                                                : 35
                                    }}
                                    animate={{
                                        opacity:
                                            1,

                                        y:
                                            0
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
                                            value={
                                                patientName
                                            }
                                            onChange={
                                                event => {

                                                    setPatientName(
                                                        event.target.value
                                                    );


                                                    setSubmittedRequest(
                                                        null
                                                    );

                                                }
                                            }
                                            placeholder={
                                                text.enterFullNamePrescription
                                            }
                                            disabled={
                                                uploading ||
                                                profileLoading
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
                                            value={
                                                patientPhone
                                            }
                                            onChange={
                                                event => {

                                                    setPatientPhone(
                                                        event.target.value
                                                    );


                                                    setSubmittedRequest(
                                                        null
                                                    );

                                                }
                                            }
                                            placeholder={
                                                text.enterPhoneNumber
                                            }
                                            dir="ltr"
                                            disabled={
                                                uploading ||
                                                profileLoading
                                            }
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


                                        <motion.div
                                            className={
                                                dragActive
                                                    ? "prescription-upload-zone active"
                                                    : "prescription-upload-zone"
                                            }
                                            role="button"
                                            tabIndex={
                                                uploading
                                                    ? -1
                                                    : 0
                                            }
                                            onClick={() => {

                                                if (
                                                    !uploading
                                                ) {

                                                    inputRef.current
                                                        ?.click();

                                                }

                                            }}
                                            onKeyDown={
                                                event => {

                                                    if (
                                                        uploading
                                                    ) {

                                                        return;

                                                    }


                                                    if (
                                                        event.key ===
                                                            "Enter" ||
                                                        event.key ===
                                                            " "
                                                    ) {

                                                        event.preventDefault();


                                                        inputRef.current
                                                            ?.click();

                                                    }

                                                }
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
                                            whileHover={
                                                uploading
                                                    ? {}
                                                    : {
                                                        scale:
                                                            1.01
                                                    }
                                            }
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


                                                            <small className="prescription-private-note">

                                                                <LockKeyhole
                                                                    size={12}
                                                                />

                                                                {
                                                                    flowText.privateUpload
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
                                                                        `${(
                                                                            file.size /
                                                                            (
                                                                                1024 *
                                                                                1024
                                                                            )
                                                                        ).toFixed(
                                                                            2
                                                                        )} MB`
                                                                    }

                                                                    {" · "}

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
                                                                disabled={
                                                                    uploading
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

                                        </motion.div>


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
                                            disabled={
                                                uploading
                                            }
                                        />

                                    </div>


                                    {/* ERROR */}

                                    <AnimatePresence>

                                        {
                                            error && (

                                                <motion.div
                                                    className="prescription-message error"
                                                    initial={{
                                                        opacity:
                                                            0,

                                                        y:
                                                            8
                                                    }}
                                                    animate={{
                                                        opacity:
                                                            1,

                                                        y:
                                                            0
                                                    }}
                                                    exit={{
                                                        opacity:
                                                            0
                                                    }}
                                                >

                                                    <AlertTriangle
                                                        size={19}
                                                    />


                                                    <span>

                                                        {
                                                            error
                                                        }

                                                    </span>

                                                </motion.div>

                                            )
                                        }

                                    </AnimatePresence>


                                    {/* SUCCESS */}

                                    <AnimatePresence>

                                        {
                                            submittedRequest && (

                                                <motion.div
                                                    className="prescription-message success"
                                                    initial={{
                                                        opacity:
                                                            0,

                                                        y:
                                                            10
                                                    }}
                                                    animate={{
                                                        opacity:
                                                            1,

                                                        y:
                                                            0
                                                    }}
                                                    exit={{
                                                        opacity:
                                                            0
                                                    }}
                                                >

                                                    <CheckCircle2
                                                        size={22}
                                                    />


                                                    <div>

                                                        <strong>

                                                            {
                                                                flowText.successTitle
                                                            }

                                                        </strong>


                                                        <span>

                                                            {
                                                                flowText.successText
                                                            }

                                                        </span>


                                                        <small>

                                                            {
                                                                flowText.requestNumber
                                                            }

                                                            {" #"}

                                                            {
                                                                requestNumber
                                                            }

                                                        </small>

                                                    </div>

                                                </motion.div>

                                            )
                                        }

                                    </AnimatePresence>


                                    {/* SUBMIT */}

                                    <button
                                        type="submit"
                                        className="primary-button prescription-submit"
                                        disabled={
                                            !file ||
                                            !patientName.trim() ||
                                            !patientPhone.trim() ||
                                            uploading ||
                                            profileLoading
                                        }
                                    >

                                        {
                                            uploading
                                                ? (

                                                    <RefreshCw
                                                        size={19}
                                                        className="prescription-spinner"
                                                    />

                                                )
                                                : (

                                                    <Upload
                                                        size={19}
                                                    />

                                                )
                                        }


                                        {
                                            uploading
                                                ? flowText.submitting
                                                : text.submitPrescription
                                        }

                                    </button>

                                </motion.form>

                            )
                }

            </div>

        </main>

    );

}


export default Prescription;