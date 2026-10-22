import {
    AlertTriangle,
    Check,
    CheckCircle2,
    Clock3,
    Eye,
    FileText,
    RefreshCw,
    Search,
    ShieldCheck,
    X,
    XCircle
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    supabase
} from "../../lib/supabase.js";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import "./AdminPrescriptions.css";


const STATUS_VALUES = [
    "pending",
    "reviewing",
    "approved",
    "rejected"
];


function AdminPrescriptions() {

    const {
        isArabic
    } = useLanguage();


    const text =
        isArabic
            ? {
                eyebrow:
                    "إدارة الروشتات",

                title:
                    "طلبات الروشتات",

                description:
                    "راجع الروشتات المرفوعة، أضف ملاحظات الصيدلية وحدّث حالة الطلب.",

                live:
                    "مباشر",

                connecting:
                    "جاري الاتصال",

                refresh:
                    "تحديث",

                total:
                    "إجمالي الطلبات",

                pending:
                    "قيد الانتظار",

                reviewing:
                    "قيد المراجعة",

                approved:
                    "تمت الموافقة",

                rejected:
                    "مرفوض",

                searchPlaceholder:
                    "ابحث بالاسم أو الهاتف أو رقم الطلب...",

                allStatuses:
                    "كل الحالات",

                customer:
                    "العميل",

                file:
                    "الروشتة",

                submitted:
                    "تاريخ الإرسال",

                status:
                    "الحالة",

                review:
                    "المراجعة",

                open:
                    "فتح",

                pharmacyNotes:
                    "ملاحظات الصيدلية",

                notesPlaceholder:
                    "اكتب ملاحظة للعميل...",

                save:
                    "حفظ المراجعة",

                saving:
                    "جاري الحفظ...",

                saved:
                    "تم تحديث الروشتة بنجاح.",

                loadError:
                    "تعذر تحميل طلبات الروشتات.",

                updateError:
                    "تعذر تحديث الروشتة.",

                previewError:
                    "تعذر فتح ملف الروشتة.",

                noRequests:
                    "لا توجد طلبات روشتات",

                noRequestsText:
                    "ستظهر الروشتات المرسلة من التطبيق هنا.",

                close:
                    "إغلاق",

                openNewTab:
                    "فتح في نافذة جديدة",

                privateFile:
                    "ملف خاص وآمن",

                request:
                    "طلب"
            }
            : {
                eyebrow:
                    "PRESCRIPTION MANAGEMENT",

                title:
                    "Prescription Requests",

                description:
                    "Review uploaded prescriptions, add pharmacy notes and update each request status.",

                live:
                    "Live",

                connecting:
                    "Connecting",

                refresh:
                    "Refresh",

                total:
                    "Total Requests",

                pending:
                    "Pending",

                reviewing:
                    "Reviewing",

                approved:
                    "Approved",

                rejected:
                    "Rejected",

                searchPlaceholder:
                    "Search customer, phone or request number...",

                allStatuses:
                    "All Statuses",

                customer:
                    "Customer",

                file:
                    "Prescription",

                submitted:
                    "Submitted",

                status:
                    "Status",

                review:
                    "Review",

                open:
                    "Open",

                pharmacyNotes:
                    "Pharmacy Notes",

                notesPlaceholder:
                    "Add a note for the customer...",

                save:
                    "Save Review",

                saving:
                    "Saving...",

                saved:
                    "Prescription updated successfully.",

                loadError:
                    "Could not load prescription requests.",

                updateError:
                    "Could not update the prescription.",

                previewError:
                    "Could not open the prescription file.",

                noRequests:
                    "No prescription requests",

                noRequestsText:
                    "Prescriptions submitted from the mobile app will appear here.",

                close:
                    "Close",

                openNewTab:
                    "Open in New Tab",

                privateFile:
                    "Private secure file",

                request:
                    "Request"
            };


    const [
        requests,
        setRequests
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        updatingId,
        setUpdatingId
    ] = useState(null);


    const [
        searchTerm,
        setSearchTerm
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter
    ] = useState("all");


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
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
    STATUS LABEL
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
            map[status] ||
            status ||
            "-"
        );

    };


    /*
    ========================================================
    LOAD REQUESTS
    ========================================================
    */

    const loadRequests =
        async (
            showLoading = true
        ) => {

            if (
                showLoading
            ) {

                setLoading(
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
                        requestsError
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
                        .order(
                            "created_at",
                            {
                                ascending:
                                    false
                            }
                        );


                if (
                    requestsError
                ) {

                    throw requestsError;

                }


                setRequests(
                    data ||
                    []
                );

            } catch (
                loadError
            ) {

                console.error(
                    "Prescription request loading error:",
                    loadError
                );


                setError(
                    loadError?.message ||
                    text.loadError
                );

            } finally {

                if (
                    showLoading
                ) {

                    setLoading(
                        false
                    );

                }

            }

        };


    /*
    ========================================================
    INITIAL LOAD
    ========================================================
    */

    useEffect(
        () => {

            loadRequests();

        },
        [
            isArabic
        ]
    );


    /*
    ========================================================
    REALTIME
    ========================================================
    */

    useEffect(
        () => {

            const channel =
                supabase
                    .channel(
                        "admin-prescription-requests"
                    )
                    .on(
                        "postgres_changes",
                        {
                            event:
                                "*",

                            schema:
                                "public",

                            table:
                                "prescription_requests"
                        },
                        () => {

                            loadRequests(
                                false
                            );

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
        []
    );


    /*
    ========================================================
    EDIT LOCAL STATUS
    ========================================================
    */

    const updateLocalStatus = (
        requestId,
        value
    ) => {

        setRequests(
            current =>
                current.map(
                    request =>
                        request.id ===
                        requestId
                            ? {
                                ...request,

                                status:
                                    value
                            }
                            : request
                )
        );

    };


    /*
    ========================================================
    EDIT LOCAL NOTE
    ========================================================
    */

    const updateLocalNote = (
        requestId,
        value
    ) => {

        setRequests(
            current =>
                current.map(
                    request =>
                        request.id ===
                        requestId
                            ? {
                                ...request,

                                pharmacy_notes:
                                    value
                            }
                            : request
                )
        );

    };


    /*
    ========================================================
    SAVE REVIEW
    ========================================================
    */

    const saveReview =
        async (
            request
        ) => {

            if (
                updatingId
            ) {

                return;

            }


            setUpdatingId(
                request.id
            );


            setError(
                ""
            );


            setSuccess(
                ""
            );


            try {

                const {
                    error:
                        updateError
                } =
                    await supabase
                        .from(
                            "prescription_requests"
                        )
                        .update({

                            status:
                                request.status,

                            pharmacy_notes:
                                request
                                    .pharmacy_notes
                                    ?.trim() ||
                                null,

                            updated_at:
                                new Date()
                                    .toISOString()

                        })
                        .eq(
                            "id",
                            request.id
                        );


                if (
                    updateError
                ) {

                    throw updateError;

                }


                setSuccess(
                    text.saved
                );


                await loadRequests(
                    false
                );

            } catch (
                saveError
            ) {

                console.error(
                    "Prescription update error:",
                    saveError
                );


                setError(
                    saveError?.message ||
                    text.updateError
                );

            } finally {

                setUpdatingId(
                    null
                );

            }

        };


    /*
    ========================================================
    OPEN PRIVATE FILE
    ========================================================
    */

    const openPrescription =
        async (
            request
        ) => {

            setPreviewLoadingId(
                request.id
            );


            setError(
                ""
            );


            try {

                const {
                    data,
                    error:
                        signedUrlError
                } =
                    await supabase
                        .storage
                        .from(
                            "prescriptions"
                        )
                        .createSignedUrl(
                            request.file_path,
                            600
                        );


                if (
                    signedUrlError
                ) {

                    throw signedUrlError;

                }


                if (
                    !data?.signedUrl
                ) {

                    throw new Error(
                        text.previewError
                    );

                }


                setPreview({

                    request,

                    url:
                        data.signedUrl

                });

            } catch (
                openError
            ) {

                console.error(
                    "Prescription preview error:",
                    openError
                );


                setError(
                    openError?.message ||
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
    SUMMARY
    ========================================================
    */

    const summary =
        useMemo(
            () => {

                return {

                    total:
                        requests.length,

                    pending:
                        requests.filter(
                            request =>
                                request.status ===
                                "pending"
                        ).length,

                    reviewing:
                        requests.filter(
                            request =>
                                request.status ===
                                "reviewing"
                        ).length,

                    approved:
                        requests.filter(
                            request =>
                                request.status ===
                                "approved"
                        ).length,

                    rejected:
                        requests.filter(
                            request =>
                                request.status ===
                                "rejected"
                        ).length

                };

            },
            [
                requests
            ]
        );


    /*
    ========================================================
    FILTERING
    ========================================================
    */

    const filteredRequests =
        useMemo(
            () => {

                const query =
                    searchTerm
                        .trim()
                        .toLowerCase();


                return requests.filter(
                    request => {

                        if (
                            statusFilter !==
                                "all" &&
                            request.status !==
                                statusFilter
                        ) {

                            return false;

                        }


                        if (
                            !query
                        ) {

                            return true;

                        }


                        const searchable =
                            [
                                request.id,
                                request.full_name,
                                request.phone,
                                request.original_file_name
                            ]
                                .filter(
                                    Boolean
                                )
                                .join(
                                    " "
                                )
                                .toLowerCase();


                        return searchable
                            .includes(
                                query
                            );

                    }
                );

            },
            [
                requests,
                searchTerm,
                statusFilter
            ]
        );


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
    LOADING
    ========================================================
    */

    if (
        loading
    ) {

        return (

            <main
                className="admin-prescriptions-page"
                dir={
                    isArabic
                        ? "rtl"
                        : "ltr"
                }
            >

                <div className="admin-prescriptions-loading">

                    <RefreshCw
                        className="admin-prescriptions-spinner"
                    />

                    {
                        text.title
                    }

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
            className="admin-prescriptions-page"
            dir={
                isArabic
                    ? "rtl"
                    : "ltr"
            }
        >

            <div className="container">


                {/* HEADER */}

                <header className="admin-prescriptions-header">

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


                    <div className="admin-prescriptions-header-actions">

                        <div
                            className={
                                realtimeConnected
                                    ? "admin-prescriptions-live connected"
                                    : "admin-prescriptions-live"
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
                                loadRequests()
                            }
                        >

                            <RefreshCw
                                size={17}
                            />

                            {
                                text.refresh
                            }

                        </button>

                    </div>

                </header>


                {/* SUCCESS */}

                {
                    success && (

                        <div className="admin-prescriptions-message success">

                            <Check
                                size={17}
                            />

                            {
                                success
                            }

                        </div>

                    )
                }


                {/* ERROR */}

                {
                    error && (

                        <div className="admin-prescriptions-message error">

                            <AlertTriangle
                                size={17}
                            />

                            {
                                error
                            }

                        </div>

                    )
                }


                {/* SUMMARY */}

                <section className="admin-prescriptions-summary">

                    <SummaryCard
                        label={
                            text.total
                        }
                        value={
                            summary.total
                        }
                        icon={
                            <FileText />
                        }
                    />


                    <SummaryCard
                        label={
                            text.pending
                        }
                        value={
                            summary.pending
                        }
                        icon={
                            <Clock3 />
                        }
                        type="pending"
                    />


                    <SummaryCard
                        label={
                            text.reviewing
                        }
                        value={
                            summary.reviewing
                        }
                        icon={
                            <Eye />
                        }
                        type="reviewing"
                    />


                    <SummaryCard
                        label={
                            text.approved
                        }
                        value={
                            summary.approved
                        }
                        icon={
                            <CheckCircle2 />
                        }
                        type="approved"
                    />


                    <SummaryCard
                        label={
                            text.rejected
                        }
                        value={
                            summary.rejected
                        }
                        icon={
                            <XCircle />
                        }
                        type="rejected"
                    />

                </section>


                {/* FILTERS */}

                <section className="admin-prescriptions-filters">

                    <div className="admin-prescriptions-search">

                        <Search
                            size={18}
                        />


                        <input
                            type="search"
                            value={
                                searchTerm
                            }
                            onChange={
                                event =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                            }
                            placeholder={
                                text.searchPlaceholder
                            }
                        />

                    </div>


                    <select
                        value={
                            statusFilter
                        }
                        onChange={
                            event =>
                                setStatusFilter(
                                    event.target.value
                                )
                        }
                    >

                        <option value="all">

                            {
                                text.allStatuses
                            }

                        </option>


                        {
                            STATUS_VALUES.map(
                                status => (

                                    <option
                                        key={
                                            status
                                        }
                                        value={
                                            status
                                        }
                                    >

                                        {
                                            statusLabel(
                                                status
                                            )
                                        }

                                    </option>

                                )
                            )
                        }

                    </select>

                </section>


                {/* REQUESTS */}

                <section className="admin-prescriptions-list">

                    {
                        filteredRequests.length ===
                        0
                            ? (

                                <div className="admin-prescriptions-empty">

                                    <FileText
                                        size={40}
                                    />


                                    <strong>

                                        {
                                            text.noRequests
                                        }

                                    </strong>


                                    <span>

                                        {
                                            text.noRequestsText
                                        }

                                    </span>

                                </div>

                            )
                            : (

                                filteredRequests.map(
                                    request => (

                                        <article
                                            key={
                                                request.id
                                            }
                                            className="admin-prescription-card"
                                        >


                                            <div className="admin-prescription-card-main">


                                                <div className="admin-prescription-request-icon">

                                                    <FileText
                                                        size={21}
                                                    />

                                                </div>


                                                <div className="admin-prescription-customer">

                                                    <span>

                                                        {
                                                            text.request
                                                        }

                                                        {" #"}

                                                        {
                                                            shortId(
                                                                request.id
                                                            )
                                                        }

                                                    </span>


                                                    <strong>

                                                        {
                                                            request.full_name
                                                        }

                                                    </strong>


                                                    <small>

                                                        {
                                                            request.phone
                                                        }

                                                    </small>

                                                </div>


                                                <div className="admin-prescription-file-info">

                                                    <span>

                                                        {
                                                            text.file
                                                        }

                                                    </span>


                                                    <strong
                                                        title={
                                                            request.original_file_name
                                                        }
                                                    >

                                                        {
                                                            request.original_file_name
                                                        }

                                                    </strong>


                                                    <small>

                                                        {
                                                            request.content_type
                                                        }

                                                    </small>

                                                </div>


                                                <div className="admin-prescription-date">

                                                    <span>

                                                        {
                                                            text.submitted
                                                        }

                                                    </span>


                                                    <strong>

                                                        {
                                                            formatDate(
                                                                request.created_at
                                                            )
                                                        }

                                                    </strong>

                                                </div>


                                                <div
                                                    className={
                                                        `admin-prescription-status ${request.status}`
                                                    }
                                                >

                                                    {
                                                        statusLabel(
                                                            request.status
                                                        )
                                                    }

                                                </div>


                                                <button
                                                    type="button"
                                                    className="admin-prescription-open"
                                                    onClick={() =>
                                                        openPrescription(
                                                            request
                                                        )
                                                    }
                                                    disabled={
                                                        previewLoadingId ===
                                                        request.id
                                                    }
                                                >

                                                    {
                                                        previewLoadingId ===
                                                        request.id
                                                            ? (

                                                                <RefreshCw
                                                                    className="admin-prescriptions-spinner"
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


                                            <div className="admin-prescription-review">


                                                <div className="admin-prescription-review-status">

                                                    <label>

                                                        {
                                                            text.status
                                                        }

                                                    </label>


                                                    <select
                                                        value={
                                                            request.status
                                                        }
                                                        onChange={
                                                            event =>
                                                                updateLocalStatus(
                                                                    request.id,
                                                                    event.target.value
                                                                )
                                                        }
                                                    >

                                                        {
                                                            STATUS_VALUES.map(
                                                                status => (

                                                                    <option
                                                                        key={
                                                                            status
                                                                        }
                                                                        value={
                                                                            status
                                                                        }
                                                                    >

                                                                        {
                                                                            statusLabel(
                                                                                status
                                                                            )
                                                                        }

                                                                    </option>

                                                                )
                                                            )
                                                        }

                                                    </select>

                                                </div>


                                                <div className="admin-prescription-review-notes">

                                                    <label>

                                                        {
                                                            text.pharmacyNotes
                                                        }

                                                    </label>


                                                    <textarea
                                                        rows="3"
                                                        value={
                                                            request.pharmacy_notes ||
                                                            ""
                                                        }
                                                        onChange={
                                                            event =>
                                                                updateLocalNote(
                                                                    request.id,
                                                                    event.target.value
                                                                )
                                                        }
                                                        placeholder={
                                                            text.notesPlaceholder
                                                        }
                                                    />

                                                </div>


                                                <button
                                                    type="button"
                                                    className="admin-prescription-save"
                                                    onClick={() =>
                                                        saveReview(
                                                            request
                                                        )
                                                    }
                                                    disabled={
                                                        updatingId ===
                                                        request.id
                                                    }
                                                >

                                                    {
                                                        updatingId ===
                                                        request.id
                                                            ? (

                                                                <RefreshCw
                                                                    className="admin-prescriptions-spinner"
                                                                    size={18}
                                                                />

                                                            )
                                                            : (

                                                                <Check
                                                                    size={18}
                                                                />

                                                            )
                                                    }


                                                    {
                                                        updatingId ===
                                                        request.id
                                                            ? text.saving
                                                            : text.save
                                                    }

                                                </button>

                                            </div>

                                        </article>

                                    )
                                )

                            )
                    }

                </section>

            </div>


            {/* PREVIEW MODAL */}

            {
                preview && (

                    <div
                        className="admin-prescription-modal-backdrop"
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

                        <div className="admin-prescription-modal">


                            <div className="admin-prescription-modal-header">

                                <div>

                                    <span>

                                        <ShieldCheck
                                            size={16}
                                        />

                                        {
                                            text.privateFile
                                        }

                                    </span>


                                    <h2>

                                        {
                                            preview
                                                .request
                                                .original_file_name
                                        }

                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    aria-label={
                                        text.close
                                    }
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

                            </div>


                            <div className="admin-prescription-preview">


                                {
                                    preview
                                        .request
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
                                                        .request
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
                                                        .request
                                                        .original_file_name
                                                }
                                            />

                                        )
                                }

                            </div>


                            <div className="admin-prescription-modal-actions">

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

                            </div>

                        </div>

                    </div>

                )
            }

        </main>

    );

}


/*
========================================================
SUMMARY CARD
========================================================
*/

function SummaryCard({

    icon,
    label,
    value,
    type = ""

}) {

    return (

        <div
            className={
                `admin-prescriptions-summary-card ${type}`
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


export default AdminPrescriptions;