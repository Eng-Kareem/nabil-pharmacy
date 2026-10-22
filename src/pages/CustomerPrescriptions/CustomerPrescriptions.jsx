import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Eye,
    FileText,
    LockKeyhole,
    MessageSquareText,
    RefreshCw,
    Search,
    ShieldCheck,
    Upload,
    X,
    XCircle
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    supabase
} from "../../lib/supabase.js";

import {
    useAuth
} from "../../context/AuthContext.jsx";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import "./CustomerPrescriptions.css";


function CustomerPrescriptions() {

    const {
        user,
        authLoading
    } = useAuth();


    const {
        isArabic
    } = useLanguage();


    const text =
        isArabic
            ? {
                eyebrow:
                    "حسابي",

                title:
                    "روشتاتي",

                description:
                    "تابع الروشتات التي أرسلتها وحالة مراجعتها من الصيدلية.",

                upload:
                    "رفع روشتة جديدة",

                live:
                    "مباشر",

                connecting:
                    "جاري الاتصال",

                refresh:
                    "تحديث",

                total:
                    "إجمالي الروشتات",

                pending:
                    "قيد الانتظار",

                reviewing:
                    "قيد المراجعة",

                approved:
                    "تمت الموافقة",

                rejected:
                    "مرفوض",

                submitted:
                    "تم الإرسال",

                pharmacyNote:
                    "ملاحظة الصيدلية",

                file:
                    "الملف",

                open:
                    "عرض الملف",

                privateFile:
                    "ملف خاص وآمن",

                openNewTab:
                    "فتح في نافذة جديدة",

                close:
                    "إغلاق",

                noPrescriptions:
                    "لا توجد روشتات حتى الآن",

                noPrescriptionsText:
                    "عند إرسال روشتة ستظهر هنا ويمكنك متابعة حالتها.",

                loadError:
                    "تعذر تحميل الروشتات.",

                previewError:
                    "تعذر فتح ملف الروشتة.",

                signInRequired:
                    "يجب تسجيل الدخول",

                signInText:
                    "سجّل الدخول لعرض الروشتات الخاصة بحسابك.",

                signIn:
                    "تسجيل الدخول",

                request:
                    "طلب",

                status:
                    "الحالة",

                submittedStep:
                    "تم الإرسال",

                reviewStep:
                    "المراجعة",

                approvedStep:
                    "الموافقة"
            }
            : {
                eyebrow:
                    "MY ACCOUNT",

                title:
                    "My Prescriptions",

                description:
                    "Track prescriptions you submitted and follow the pharmacy review status live.",

                upload:
                    "Upload New Prescription",

                live:
                    "Live",

                connecting:
                    "Connecting",

                refresh:
                    "Refresh",

                total:
                    "Total Prescriptions",

                pending:
                    "Pending",

                reviewing:
                    "Reviewing",

                approved:
                    "Approved",

                rejected:
                    "Rejected",

                submitted:
                    "Submitted",

                pharmacyNote:
                    "Pharmacy Note",

                file:
                    "File",

                open:
                    "View File",

                privateFile:
                    "Private secure file",

                openNewTab:
                    "Open in New Tab",

                close:
                    "Close",

                noPrescriptions:
                    "No prescriptions yet",

                noPrescriptionsText:
                    "When you submit a prescription it will appear here so you can track its status.",

                loadError:
                    "Could not load your prescriptions.",

                previewError:
                    "Could not open the prescription file.",

                signInRequired:
                    "Sign in required",

                signInText:
                    "Sign in to see prescriptions belonging to your account.",

                signIn:
                    "Sign In",

                request:
                    "Request",

                status:
                    "Status",

                submittedStep:
                    "Submitted",

                reviewStep:
                    "Review",

                approvedStep:
                    "Approved"
            };


    const [
        prescriptions,
        setPrescriptions
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        refreshing,
        setRefreshing
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        realtimeConnected,
        setRealtimeConnected
    ] = useState(false);


    const [
        preview,
        setPreview
    ] = useState(null);


    const [
        previewLoadingId,
        setPreviewLoadingId
    ] = useState(null);


    /*
    ========================================================
    LOAD PRESCRIPTIONS
    ========================================================
    */

    const loadPrescriptions =
        useCallback(
            async (
                showRefresh = false
            ) => {

                if (
                    !user?.id
                ) {

                    setPrescriptions(
                        []
                    );


                    setLoading(
                        false
                    );


                    return;

                }


                if (
                    showRefresh
                ) {

                    setRefreshing(
                        true
                    );

                }


                setError(
                    ""
                );


                try {

                    const {
                        data,
                        error:
                            loadError
                    } =
                        await supabase
                            .from(
                                "prescription_requests"
                            )
                            .select(`
                                id,
                                user_id,
                                full_name,
                                phone,
                                file_path,
                                original_file_name,
                                content_type,
                                status,
                                pharmacy_notes,
                                created_at,
                                updated_at
                            `)
                            .eq(
                                "user_id",
                                user.id
                            )
                            .order(
                                "created_at",
                                {
                                    ascending:
                                        false
                                }
                            );


                    if (
                        loadError
                    ) {

                        throw loadError;

                    }


                    setPrescriptions(
                        data ||
                        []
                    );

                } catch (
                    loadError
                ) {

                    console.error(
                        "Customer prescription loading error:",
                        loadError
                    );


                    setError(
                        loadError?.message ||
                        text.loadError
                    );

                } finally {

                    setLoading(
                        false
                    );


                    setRefreshing(
                        false
                    );

                }

            },
            [
                user?.id,
                isArabic
            ]
        );


    /*
    ========================================================
    INITIAL LOAD
    ========================================================
    */

    useEffect(
        () => {

            if (
                authLoading
            ) {

                return;

            }


            loadPrescriptions();

        },
        [
            authLoading,
            loadPrescriptions
        ]
    );


    /*
    ========================================================
    REALTIME
    ========================================================
    */

    useEffect(
        () => {

            if (
                !user?.id
            ) {

                setRealtimeConnected(
                    false
                );


                return undefined;

            }


            const channel =
                supabase
                    .channel(
                        `customer-prescriptions-${user.id}`
                    )
                    .on(
                        "postgres_changes",
                        {
                            event:
                                "*",

                            schema:
                                "public",

                            table:
                                "prescription_requests",

                            filter:
                                `user_id=eq.${user.id}`
                        },
                        () => {

                            loadPrescriptions();

                        }
                    )
                    .subscribe(
                        status => {

                            setRealtimeConnected(
                                status ===
                                "SUBSCRIBED"
                            );

                        }
                    );


            return () => {

                supabase
                    .removeChannel(
                        channel
                    );

            };

        },
        [
            user?.id,
            loadPrescriptions
        ]
    );


    /*
    ========================================================
    STATUS
    ========================================================
    */

    const statusLabel = (
        status
    ) => {

        const map = {
            pending:
                text.pending,

            reviewing:
                text.reviewing,

            approved:
                text.approved,

            rejected:
                text.rejected
        };


        return (
            map[
                status
            ] ||
            status
        );

    };


    /*
    ========================================================
    DATE
    ========================================================
    */

    const formatDate = (
        value
    ) => {

        if (
            !value
        ) {

            return "-";

        }


        return new Intl
            .DateTimeFormat(
                isArabic
                    ? "ar-EG"
                    : "en-GB",
                {
                    dateStyle:
                        "medium",

                    timeStyle:
                        "short"
                }
            )
            .format(
                new Date(
                    value
                )
            );

    };


    /*
    ========================================================
    SHORT ID
    ========================================================
    */

    const shortId = (
        id
    ) => {

        return String(
            id ||
            ""
        )
            .slice(
                0,
                8
            )
            .toUpperCase();

    };


    /*
    ========================================================
    PRIVATE PREVIEW
    ========================================================
    */

    const openPrescription =
        async (
            prescription
        ) => {

            setPreviewLoadingId(
                prescription.id
            );


            setError(
                ""
            );


            try {

                const {
                    data,
                    error:
                        signedError
                } =
                    await supabase
                        .storage
                        .from(
                            "prescriptions"
                        )
                        .createSignedUrl(
                            prescription.file_path,
                            600
                        );


                if (
                    signedError
                ) {

                    throw signedError;

                }


                if (
                    !data?.signedUrl
                ) {

                    throw new Error(
                        text.previewError
                    );

                }


                setPreview({
                    prescription,

                    url:
                        data.signedUrl
                });

            } catch (
                previewError
            ) {

                console.error(
                    "Customer prescription preview error:",
                    previewError
                );


                setError(
                    previewError?.message ||
                    text.previewError
                );

            } finally {

                setPreviewLoadingId(
                    null
                );

            }

        };


    /*
    ========================================================
    STATS
    ========================================================
    */

    const stats =
        useMemo(
            () => {

                return {
                    total:
                        prescriptions.length,

                    pending:
                        prescriptions.filter(
                            item =>
                                item.status ===
                                "pending"
                        ).length,

                    reviewing:
                        prescriptions.filter(
                            item =>
                                item.status ===
                                "reviewing"
                        ).length,

                    approved:
                        prescriptions.filter(
                            item =>
                                item.status ===
                                "approved"
                        ).length,

                    rejected:
                        prescriptions.filter(
                            item =>
                                item.status ===
                                "rejected"
                        ).length
                };

            },
            [
                prescriptions
            ]
        );


    /*
    ========================================================
    AUTH LOADING
    ========================================================
    */

    if (
        authLoading
    ) {

        return (

            <main className="customer-prescriptions-page">

                <div className="customer-prescriptions-loading">

                    <RefreshCw
                        className="customer-prescriptions-spinner"
                        size={34}
                    />

                </div>

            </main>

        );

    }


    /*
    ========================================================
    SIGNED OUT
    ========================================================
    */

    if (
        !user
    ) {

        return (

            <main
                className="customer-prescriptions-page"
                dir={
                    isArabic
                        ? "rtl"
                        : "ltr"
                }
            >

                <div className="container">

                    <div className="customer-prescriptions-auth">

                        <div>

                            <LockKeyhole
                                size={30}
                            />

                        </div>


                        <h1>

                            {
                                text.signInRequired
                            }

                        </h1>


                        <p>

                            {
                                text.signInText
                            }

                        </p>


                        <Link
                            to="/account"
                        >

                            {
                                text.signIn
                            }

                        </Link>

                    </div>

                </div>

            </main>

        );

    }


    /*
    ========================================================
    PAGE
    ========================================================
    */

    return (

        <main
            className="customer-prescriptions-page"
            dir={
                isArabic
                    ? "rtl"
                    : "ltr"
            }
        >

            <div className="container">


                {/* HEADER */}

                <header className="customer-prescriptions-header">

                    <div>

                        <span>

                            {
                                text.eyebrow
                            }

                        </span>


                        <h1>

                            {
                                text.title
                            }

                        </h1>


                        <p>

                            {
                                text.description
                            }

                        </p>

                    </div>


                    <div className="customer-prescriptions-header-actions">

                        <div
                            className={
                                realtimeConnected
                                    ? "customer-prescriptions-live connected"
                                    : "customer-prescriptions-live"
                            }
                        >

                            <span>
                            </span>


                            {
                                realtimeConnected
                                    ? text.live
                                    : text.connecting
                            }

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                loadPrescriptions(
                                    true
                                )
                            }
                            disabled={
                                refreshing
                            }
                        >

                            <RefreshCw
                                size={17}
                                className={
                                    refreshing
                                        ? "customer-prescriptions-spinner"
                                        : ""
                                }
                            />

                            {
                                text.refresh
                            }

                        </button>


                        <Link
                            to="/prescription"
                            className="customer-prescriptions-upload"
                        >

                            <Upload
                                size={17}
                            />

                            {
                                text.upload
                            }

                        </Link>

                    </div>

                </header>


                {/* ERROR */}

                {
                    error && (

                        <div className="customer-prescriptions-error">

                            <AlertTriangle
                                size={18}
                            />

                            {
                                error
                            }

                        </div>

                    )
                }


                {/* STATS */}

                <section className="customer-prescriptions-stats">

                    <PrescriptionStat
                        label={
                            text.total
                        }
                        value={
                            stats.total
                        }
                        icon={
                            <FileText />
                        }
                    />


                    <PrescriptionStat
                        label={
                            text.pending
                        }
                        value={
                            stats.pending
                        }
                        icon={
                            <Clock3 />
                        }
                        type="pending"
                    />


                    <PrescriptionStat
                        label={
                            text.reviewing
                        }
                        value={
                            stats.reviewing
                        }
                        icon={
                            <Search />
                        }
                        type="reviewing"
                    />


                    <PrescriptionStat
                        label={
                            text.approved
                        }
                        value={
                            stats.approved
                        }
                        icon={
                            <CheckCircle2 />
                        }
                        type="approved"
                    />


                    <PrescriptionStat
                        label={
                            text.rejected
                        }
                        value={
                            stats.rejected
                        }
                        icon={
                            <XCircle />
                        }
                        type="rejected"
                    />

                </section>


                {/* CONTENT */}

                {
                    loading
                        ? (

                            <div className="customer-prescriptions-loading">

                                <RefreshCw
                                    className="customer-prescriptions-spinner"
                                    size={34}
                                />

                            </div>

                        )
                        : prescriptions.length ===
                            0
                            ? (

                                <div className="customer-prescriptions-empty">

                                    <FileText
                                        size={48}
                                    />


                                    <strong>

                                        {
                                            text.noPrescriptions
                                        }

                                    </strong>


                                    <span>

                                        {
                                            text.noPrescriptionsText
                                        }

                                    </span>


                                    <Link
                                        to="/prescription"
                                    >

                                        <Upload
                                            size={17}
                                        />

                                        {
                                            text.upload
                                        }

                                    </Link>

                                </div>

                            )
                            : (

                                <section className="customer-prescriptions-list">

                                    {
                                        prescriptions.map(
                                            prescription => (

                                                <article
                                                    className="customer-prescription-card"
                                                    key={
                                                        prescription.id
                                                    }
                                                >

                                                    <div className="customer-prescription-top">

                                                        <div className="customer-prescription-document">

                                                            <FileText
                                                                size={22}
                                                            />

                                                        </div>


                                                        <div className="customer-prescription-heading">

                                                            <span>

                                                                {
                                                                    text.request
                                                                }

                                                                {" #"}

                                                                {
                                                                    shortId(
                                                                        prescription.id
                                                                    )
                                                                }

                                                            </span>


                                                            <strong>

                                                                {
                                                                    prescription
                                                                        .original_file_name
                                                                }

                                                            </strong>


                                                            <small>

                                                                {
                                                                    text.submitted
                                                                }

                                                                {": "}

                                                                {
                                                                    formatDate(
                                                                        prescription.created_at
                                                                    )
                                                                }

                                                            </small>

                                                        </div>


                                                        <span
                                                            className={
                                                                `customer-prescription-status ${
                                                                    prescription.status
                                                                }`
                                                            }
                                                        >

                                                            {
                                                                statusLabel(
                                                                    prescription.status
                                                                )
                                                            }

                                                        </span>

                                                    </div>


                                                    <StatusProgress
                                                        status={
                                                            prescription.status
                                                        }
                                                        text={
                                                            text
                                                        }
                                                    />


                                                    {
                                                        prescription
                                                            .pharmacy_notes
                                                            ?.trim() && (

                                                            <div className="customer-prescription-note">

                                                                <MessageSquareText
                                                                    size={18}
                                                                />


                                                                <div>

                                                                    <strong>

                                                                        {
                                                                            text.pharmacyNote
                                                                        }

                                                                    </strong>


                                                                    <p>

                                                                        {
                                                                            prescription
                                                                                .pharmacy_notes
                                                                        }

                                                                    </p>

                                                                </div>

                                                            </div>

                                                        )
                                                    }


                                                    <div className="customer-prescription-bottom">

                                                        <div>

                                                            <ShieldCheck
                                                                size={16}
                                                            />

                                                            {
                                                                text.privateFile
                                                            }

                                                        </div>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openPrescription(
                                                                    prescription
                                                                )
                                                            }
                                                            disabled={
                                                                previewLoadingId ===
                                                                prescription.id
                                                            }
                                                        >

                                                            {
                                                                previewLoadingId ===
                                                                prescription.id
                                                                    ? (

                                                                        <RefreshCw
                                                                            className="customer-prescriptions-spinner"
                                                                            size={17}
                                                                        />

                                                                    )
                                                                    : (

                                                                        <Eye
                                                                            size={17}
                                                                        />

                                                                    )
                                                            }


                                                            {
                                                                text.open
                                                            }

                                                        </button>

                                                    </div>

                                                </article>

                                            )
                                        )
                                    }

                                </section>

                            )
                }

            </div>


            {/* PREVIEW */}

            {
                preview && (

                    <div
                        className="customer-prescription-preview-backdrop"
                        onMouseDown={
                            event => {

                                if (
                                    event.target ===
                                    event.currentTarget
                                ) {

                                    setPreview(
                                        null
                                    );

                                }

                            }
                        }
                    >

                        <div className="customer-prescription-preview-modal">

                            <header>

                                <div>

                                    <span>

                                        <ShieldCheck
                                            size={16}
                                        />

                                        {
                                            text.privateFile
                                        }

                                    </span>


                                    <strong>

                                        {
                                            preview
                                                .prescription
                                                .original_file_name
                                        }

                                    </strong>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setPreview(
                                            null
                                        )
                                    }
                                >

                                    <X
                                        size={20}
                                    />

                                </button>

                            </header>


                            <div className="customer-prescription-preview-file">

                                {
                                    preview
                                        .prescription
                                        .content_type
                                        ?.startsWith(
                                            "image/"
                                        )
                                        ? (

                                            <img
                                                src={
                                                    preview.url
                                                }
                                                alt={
                                                    preview
                                                        .prescription
                                                        .original_file_name
                                                }
                                            />

                                        )
                                        : (

                                            <iframe
                                                src={
                                                    preview.url
                                                }
                                                title={
                                                    preview
                                                        .prescription
                                                        .original_file_name
                                                }
                                            />

                                        )
                                }

                            </div>


                            <footer>

                                <a
                                    href={
                                        preview.url
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                >

                                    <Eye
                                        size={17}
                                    />

                                    {
                                        text.openNewTab
                                    }

                                </a>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setPreview(
                                            null
                                        )
                                    }
                                >

                                    {
                                        text.close
                                    }

                                </button>

                            </footer>

                        </div>

                    </div>

                )
            }

        </main>

    );

}


/*
========================================================
STAT
========================================================
*/

function PrescriptionStat({
    icon,
    label,
    value,
    type = ""
}) {

    return (

        <div
            className={
                `customer-prescription-stat ${type}`
            }
        >

            <div>

                {
                    icon
                }

            </div>


            <span>

                {
                    label
                }

            </span>


            <strong>

                {
                    value
                }

            </strong>

        </div>

    );

}


/*
========================================================
PROGRESS
========================================================
*/

function StatusProgress({
    status,
    text
}) {

    if (
        status ===
        "rejected"
    ) {

        return (

            <div className="customer-prescription-rejected">

                <XCircle
                    size={18}
                />

                {
                    text.rejected
                }

            </div>

        );

    }


    const reviewing =
        status ===
            "reviewing" ||
        status ===
            "approved";


    const approved =
        status ===
        "approved";


    return (

        <div className="customer-prescription-progress">

            <div className="customer-prescription-progress-step complete">

                <span>

                    <CheckCircle2
                        size={15}
                    />

                </span>


                <small>

                    {
                        text.submittedStep
                    }

                </small>

            </div>


            <div
                className={
                    reviewing
                        ? "customer-prescription-progress-line complete"
                        : "customer-prescription-progress-line"
                }
            >
            </div>


            <div
                className={
                    reviewing
                        ? "customer-prescription-progress-step complete"
                        : "customer-prescription-progress-step"
                }
            >

                <span>

                    {
                        reviewing
                            ? (

                                <CheckCircle2
                                    size={15}
                                />

                            )
                            : (

                                <Search
                                    size={15}
                                />

                            )
                    }

                </span>


                <small>

                    {
                        text.reviewStep
                    }

                </small>

            </div>


            <div
                className={
                    approved
                        ? "customer-prescription-progress-line complete"
                        : "customer-prescription-progress-line"
                }
            >
            </div>


            <div
                className={
                    approved
                        ? "customer-prescription-progress-step complete"
                        : "customer-prescription-progress-step"
                }
            >

                <span>

                    {
                        approved
                            ? (

                                <CheckCircle2
                                    size={15}
                                />

                            )
                            : (

                                <Clock3
                                    size={15}
                                />

                            )
                    }

                </span>


                <small>

                    {
                        text.approvedStep
                    }

                </small>

            </div>

        </div>

    );

}


export default CustomerPrescriptions;