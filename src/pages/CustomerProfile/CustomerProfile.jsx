import {
    Camera,
    Check,
    Eye,
    EyeOff,
    LockKeyhole,
    LogOut,
    Mail,
    Phone,
    Save,
    ShieldCheck,
    ShoppingBag,
    Trash2,
    Upload,
    User,
    UserRound
} from "lucide-react";

import {
    useEffect,
    useRef,
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

import profileTranslations
    from "../../i18n/profileTranslations.js";

import ProfileImageCropper
    from "../../components/ProfileImageCropper/ProfileImageCropper.jsx";

import "./CustomerProfile.css";


function CustomerProfile() {

    const {
        user,
        signOut
    } = useAuth();


    const {
        language,
        isArabic
    } = useLanguage();


    const text =
        profileTranslations[language] ||
        profileTranslations.en;


    const imageInputRef =
        useRef(null);


    const [
        profile,
        setProfile
    ] = useState(null);


    const [
        fullName,
        setFullName
    ] = useState("");


    const [
        username,
        setUsername
    ] = useState("");


    const [
        phone,
        setPhone
    ] = useState("");


    const [
        avatarUrl,
        setAvatarUrl
    ] = useState("");


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        uploading,
        setUploading
    ] = useState(false);


    const [
        success,
        setSuccess
    ] = useState("");


    const [
        error,
        setError
    ] = useState("");


    /*
    ========================================================
    CROPPER STATE
    ========================================================
    */

    const [
        cropImageSource,
        setCropImageSource
    ] = useState("");


    /*
    ========================================================
    PASSWORD STATE
    ========================================================
    */

    const [
        currentPassword,
        setCurrentPassword
    ] = useState("");


    const [
        newPassword,
        setNewPassword
    ] = useState("");


    const [
        confirmPassword,
        setConfirmPassword
    ] = useState("");


    const [
        showCurrentPassword,
        setShowCurrentPassword
    ] = useState(false);


    const [
        showNewPassword,
        setShowNewPassword
    ] = useState(false);


    const [
        passwordLoading,
        setPasswordLoading
    ] = useState(false);


    const [
        passwordSuccess,
        setPasswordSuccess
    ] = useState("");


    const [
        passwordError,
        setPasswordError
    ] = useState("");


    /*
    ========================================================
    LOAD PROFILE
    ========================================================
    */

    useEffect(
        () => {

            let mounted =
                true;


            const loadProfile =
                async () => {

                    if (!user?.id) {

                        return;

                    }


                    setLoading(true);


                    try {

                        const {
                            data,
                            error: profileError
                        } =
                            await supabase
                                .from("profiles")
                                .select(`
                                    id,
                                    full_name,
                                    username,
                                    phone,
                                    avatar_url,
                                    role
                                `)
                                .eq("id", user.id)
                                .single();


                        if (profileError) {

                            throw profileError;

                        }


                        if (!mounted) {

                            return;

                        }


                        setProfile(data);


                        setFullName(
                            data.full_name ||
                            user.user_metadata?.full_name ||
                            ""
                        );


                        setUsername(
                            data.username ||
                            ""
                        );


                        setPhone(
                            data.phone ||
                            ""
                        );


                        setAvatarUrl(
                            data.avatar_url ||
                            ""
                        );

                    } catch (loadError) {

                        console.error(
                            "Profile loading error:",
                            loadError
                        );


                        if (mounted) {

                            setError(
                                text.loadError
                            );

                        }

                    } finally {

                        if (mounted) {

                            setLoading(false);

                        }

                    }

                };


            loadProfile();


            return () => {

                mounted = false;

            };

        },
        [
            user?.id,
            language
        ]
    );


    /*
    ========================================================
    CLEAN CROP IMAGE URL
    ========================================================
    */

    useEffect(
        () => {

            return () => {

                if (
                    cropImageSource &&
                    cropImageSource.startsWith("blob:")
                ) {

                    URL.revokeObjectURL(
                        cropImageSource
                    );

                }

            };

        },
        [
            cropImageSource
        ]
    );


    /*
    ========================================================
    ROLE
    ========================================================
    */

    const roleLabel = (role) => {

        if (
            role ===
            "super_admin"
        ) {

            return text.superAdmin;

        }


        if (
            role ===
            "admin"
        ) {

            return text.admin;

        }


        return text.customer;

    };


    /*
    ========================================================
    USERNAME VALIDATION
    ========================================================
    */

    const validUsername = (
        value
    ) => {

        const clean =
            value.trim();


        if (!clean) {

            return true;

        }


        if (
            clean.length < 3 ||
            clean.length > 30
        ) {

            return false;

        }


        return /^[\p{L}\p{N}._-]+$/u
            .test(clean);

    };


    /*
    ========================================================
    SAVE PROFILE
    ========================================================
    */

    const saveProfile =
        async (event) => {

            event.preventDefault();


            if (
                saving ||
                !user
            ) {

                return;

            }


            setError("");
            setSuccess("");


            if (
                !validUsername(
                    username
                )
            ) {

                setError(
                    text.invalidUsername
                );

                return;

            }


            setSaving(true);


            try {

                const cleanedUsername =
                    username.trim() ||
                    null;


                const {
                    error: updateError
                } =
                    await supabase
                        .from("profiles")
                        .update({

                            full_name:
                                fullName.trim(),

                            username:
                                cleanedUsername,

                            phone:
                                phone.trim() ||
                                null,

                            avatar_url:
                                avatarUrl ||
                                null,

                            updated_at:
                                new Date()
                                    .toISOString()

                        })
                        .eq(
                            "id",
                            user.id
                        );


                if (updateError) {

                    throw updateError;

                }


                const {
                    error: metadataError
                } =
                    await supabase
                        .auth
                        .updateUser({

                            data: {

                                full_name:
                                    fullName.trim(),

                                username:
                                    cleanedUsername,

                                phone:
                                    phone.trim() ||
                                    null,

                                avatar_url:
                                    avatarUrl ||
                                    null

                            }

                        });


                if (metadataError) {

                    throw metadataError;

                }


                setProfile(
                    current => ({

                        ...current,

                        full_name:
                            fullName.trim(),

                        username:
                            cleanedUsername,

                        phone:
                            phone.trim() ||
                            null,

                        avatar_url:
                            avatarUrl ||
                            null

                    })
                );


                setSuccess(
                    text.profileSaved
                );

            } catch (saveError) {

                console.error(
                    "Profile save error:",
                    saveError
                );


                if (
                    saveError?.code ===
                    "23505"
                ) {

                    setError(
                        text.usernameTaken
                    );

                } else {

                    setError(
                        isArabic
                            ? text.saveError
                            : (
                                saveError?.message ||
                                text.saveError
                            )
                    );

                }

            } finally {

                setSaving(false);

            }

        };


    /*
    ========================================================
    USER SELECTS PHOTO
    ========================================================

    IMPORTANT:

    We do NOT upload immediately.

    We create a temporary local image URL and open the
    cropper first.
    ========================================================
    */

    const handleImageSelected =
        (event) => {

            const file =
                event.target.files?.[0];


            event.target.value =
                "";


            if (!file) {

                return;

            }


            setError("");
            setSuccess("");


            const acceptedTypes = [

                "image/jpeg",

                "image/png",

                "image/webp"

            ];


            if (
                !acceptedTypes.includes(
                    file.type
                )
            ) {

                setError(
                    text.imageType
                );

                return;

            }


            if (
                file.size >
                5 *
                1024 *
                1024
            ) {

                setError(
                    text.imageSize
                );

                return;

            }


            if (
                cropImageSource &&
                cropImageSource.startsWith(
                    "blob:"
                )
            ) {

                URL.revokeObjectURL(
                    cropImageSource
                );

            }


            const localUrl =
                URL.createObjectURL(
                    file
                );


            setCropImageSource(
                localUrl
            );

        };


    /*
    ========================================================
    CANCEL CROPPER
    ========================================================
    */

    const cancelCrop =
        () => {

            if (
                cropImageSource &&
                cropImageSource.startsWith(
                    "blob:"
                )
            ) {

                URL.revokeObjectURL(
                    cropImageSource
                );

            }


            setCropImageSource(
                ""
            );

        };


    /*
    ========================================================
    SAVE CROPPED PHOTO
    ========================================================

    ProfileImageCropper sends us the already-cropped JPEG.

    Only THIS image is uploaded to Supabase.
    ========================================================
    */

    const saveCroppedAvatar =
        async (
            croppedBlob
        ) => {

            if (
                !croppedBlob ||
                !user
            ) {

                return;

            }


            setUploading(true);

            setError("");
            setSuccess("");


            try {

                const filePath =
                    `${user.id}/avatar-${Date.now()}.jpg`;


                const {
                    error: uploadError
                } =
                    await supabase
                        .storage
                        .from(
                            "profile-avatars"
                        )
                        .upload(
                            filePath,
                            croppedBlob,
                            {

                                upsert:
                                    false,

                                cacheControl:
                                    "3600",

                                contentType:
                                    "image/jpeg"

                            }
                        );


                if (uploadError) {

                    throw uploadError;

                }


                const {
                    data
                } =
                    supabase
                        .storage
                        .from(
                            "profile-avatars"
                        )
                        .getPublicUrl(
                            filePath
                        );


                const publicUrl =
                    data?.publicUrl;


                if (!publicUrl) {

                    throw new Error(
                        text.saveError
                    );

                }


                /*
                ============================================
                PROFILE TABLE
                ============================================
                */

                const {
                    error: profileError
                } =
                    await supabase
                        .from(
                            "profiles"
                        )
                        .update({

                            avatar_url:
                                publicUrl,

                            updated_at:
                                new Date()
                                    .toISOString()

                        })
                        .eq(
                            "id",
                            user.id
                        );


                if (profileError) {

                    throw profileError;

                }


                /*
                ============================================
                AUTH METADATA

                Navbar can immediately use this as a backup.
                ============================================
                */

                const {
                    error: authError
                } =
                    await supabase
                        .auth
                        .updateUser({

                            data: {

                                avatar_url:
                                    publicUrl

                            }

                        });


                if (authError) {

                    throw authError;

                }


                setAvatarUrl(
                    publicUrl
                );


                setProfile(
                    current => ({

                        ...current,

                        avatar_url:
                            publicUrl

                    })
                );


                setSuccess(
                    text.profileSaved
                );


                if (
                    cropImageSource &&
                    cropImageSource.startsWith(
                        "blob:"
                    )
                ) {

                    URL.revokeObjectURL(
                        cropImageSource
                    );

                }


                setCropImageSource(
                    ""
                );

            } catch (uploadError) {

                console.error(
                    "Cropped avatar upload error:",
                    uploadError
                );


                setError(
                    isArabic
                        ? text.saveError
                        : (
                            uploadError?.message ||
                            text.saveError
                        )
                );


                throw uploadError;

            } finally {

                setUploading(false);

            }

        };


    /*
    ========================================================
    REMOVE AVATAR
    ========================================================
    */

    const removeAvatar =
        async () => {

            if (
                !user ||
                uploading
            ) {

                return;

            }


            setUploading(true);

            setError("");
            setSuccess("");


            try {

                const {
                    error: profileError
                } =
                    await supabase
                        .from(
                            "profiles"
                        )
                        .update({

                            avatar_url:
                                null,

                            updated_at:
                                new Date()
                                    .toISOString()

                        })
                        .eq(
                            "id",
                            user.id
                        );


                if (profileError) {

                    throw profileError;

                }


                const {
                    error: authError
                } =
                    await supabase
                        .auth
                        .updateUser({

                            data: {

                                avatar_url:
                                    null

                            }

                        });


                if (authError) {

                    throw authError;

                }


                setAvatarUrl("");


                setProfile(
                    current => ({

                        ...current,

                        avatar_url:
                            null

                    })
                );


                setSuccess(
                    text.profileSaved
                );

            } catch (removeError) {

                console.error(
                    "Remove avatar error:",
                    removeError
                );


                setError(
                    text.saveError
                );

            } finally {

                setUploading(false);

            }

        };


    /*
    ========================================================
    PASSWORD
    ========================================================
    */

    const updatePassword =
        async (event) => {

            event.preventDefault();


            if (
                passwordLoading ||
                !user
            ) {

                return;

            }


            setPasswordError("");
            setPasswordSuccess("");


            if (!currentPassword) {

                setPasswordError(
                    text.currentPasswordRequired
                );

                return;

            }


            if (
                newPassword.length <
                8
            ) {

                setPasswordError(
                    text.passwordLength
                );

                return;

            }


            if (
                newPassword !==
                confirmPassword
            ) {

                setPasswordError(
                    text.passwordMismatch
                );

                return;

            }


            setPasswordLoading(true);


            try {

                const {
                    error: verificationError
                } =
                    await supabase
                        .auth
                        .signInWithPassword({

                            email:
                                user.email,

                            password:
                                currentPassword

                        });


                if (verificationError) {

                    setPasswordError(
                        text.incorrectPassword
                    );

                    return;

                }


                const {
                    error: passwordUpdateError
                } =
                    await supabase
                        .auth
                        .updateUser({

                            password:
                                newPassword

                        });


                if (passwordUpdateError) {

                    throw passwordUpdateError;

                }


                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");


                setPasswordSuccess(
                    text.passwordUpdated
                );

            } catch (updateError) {

                console.error(
                    "Password update error:",
                    updateError
                );


                setPasswordError(
                    isArabic
                        ? text.passwordError
                        : (
                            updateError?.message ||
                            text.passwordError
                        )
                );

            } finally {

                setPasswordLoading(false);

            }

        };


    /*
    ========================================================
    LOADING
    ========================================================
    */

    if (loading) {

        return (

            <main className="customer-profile-page">

                <div className="customer-profile-loading">

                    <UserRound
                        size={38}
                    />

                    {
                        text.myProfile
                    }

                </div>

            </main>

        );

    }


    /*
    ========================================================
    INITIALS
    ========================================================
    */

    const initials =
        fullName
            .trim()
            .split(/\s+/)
            .slice(
                0,
                2
            )
            .map(
                part =>
                    part[0]
            )
            .join("")
            .toUpperCase() ||
        "NP";


    return (

        <main
            className="customer-profile-page"
            dir={
                isArabic
                    ? "rtl"
                    : "ltr"
            }
        >

            <div className="container customer-profile-container">


                {/* =========================================
                    HEADER
                ========================================= */}

                <header className="customer-profile-header">

                    <div>

                        <span>
                            {text.account}
                        </span>

                        <h1>
                            {text.myProfile}
                        </h1>

                        <p>
                            {text.profileDescription}
                        </p>

                    </div>


                    <div className="customer-profile-header-actions">

                        <Link
                            to="/products"
                        >

                            <ShoppingBag
                                size={17}
                            />

                            {text.shopProducts}

                        </Link>


                        <button
                            type="button"
                            onClick={
                                signOut
                            }
                        >

                            <LogOut
                                size={17}
                            />

                            {text.signOut}

                        </button>

                    </div>

                </header>


                {/* =========================================
                    MESSAGES
                ========================================= */}

                {
                    success && (

                        <div className="customer-profile-message success">

                            <Check
                                size={17}
                            />

                            {success}

                        </div>

                    )
                }


                {
                    error && (

                        <div className="customer-profile-message error">

                            {error}

                        </div>

                    )
                }


                <div className="customer-profile-grid">


                    {/* =====================================
                        LEFT
                    ===================================== */}

                    <div className="customer-profile-left-column">


                        {/* =================================
                            INTERACTIVE ID
                        ================================= */}

                        <div className="customer-profile-card customer-profile-id-preview-card">

                            <div className="customer-profile-section-heading">

                                <ShieldCheck
                                    size={21}
                                />

                                <div>

                                    <span>
                                        {text.livePreview}
                                    </span>

                                    <h2>
                                        {text.liveIdCard}
                                    </h2>

                                    <p>
                                        {text.liveIdDescription}
                                    </p>

                                </div>

                            </div>


                            <InteractiveIdCard
                                fullName={
                                    fullName
                                }
                                phone={
                                    phone
                                }
                                email={
                                    user?.email ||
                                    ""
                                }
                                avatarUrl={
                                    avatarUrl
                                }
                                initials={
                                    initials
                                }
                                role={
                                    roleLabel(
                                        profile?.role
                                    )
                                }
                                text={
                                    text
                                }
                            />

                        </div>


                        {/* =================================
                            PERSONAL INFO
                        ================================= */}

                        <form
                            className="customer-profile-card"
                            onSubmit={
                                saveProfile
                            }
                        >

                            <div className="customer-profile-section-heading">

                                <User
                                    size={21}
                                />

                                <div>

                                    <span>
                                        {text.account}
                                    </span>

                                    <h2>
                                        {text.personalInformation}
                                    </h2>

                                </div>

                            </div>


                            {/* =============================
                                PROFILE PHOTO
                            ============================= */}

                            <div className="customer-profile-avatar-section">

                                <div className="customer-profile-avatar">

                                    {
                                        avatarUrl
                                            ? (

                                                <img
                                                    src={
                                                        avatarUrl
                                                    }
                                                    alt={
                                                        fullName
                                                    }
                                                />

                                            )
                                            : (

                                                <strong>
                                                    {initials}
                                                </strong>

                                            )
                                    }


                                    <span>

                                        <Camera
                                            size={16}
                                        />

                                    </span>

                                </div>


                                <div className="customer-profile-avatar-actions">

                                    <strong>
                                        {text.profilePicture}
                                    </strong>


                                    <p>
                                        {text.photoHelp}
                                    </p>


                                    <div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                imageInputRef
                                                    .current
                                                    ?.click()
                                            }
                                            disabled={
                                                uploading
                                            }
                                        >

                                            <Upload
                                                size={16}
                                            />

                                            {
                                                uploading
                                                    ? text.uploading
                                                    : text.changePhoto
                                            }

                                        </button>


                                        {
                                            avatarUrl && (

                                                <button
                                                    type="button"
                                                    className="remove"
                                                    onClick={
                                                        removeAvatar
                                                    }
                                                    disabled={
                                                        uploading
                                                    }
                                                >

                                                    <Trash2
                                                        size={16}
                                                    />

                                                    {
                                                        text.removePhoto
                                                    }

                                                </button>

                                            )
                                        }

                                    </div>


                                    {/* =========================
                                        FILE PICKER

                                        Notice this uses
                                        handleImageSelected.

                                        It DOES NOT upload directly.
                                    ========================= */}

                                    <input
                                        ref={
                                            imageInputRef
                                        }
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={
                                            handleImageSelected
                                        }
                                        hidden
                                    />

                                </div>

                            </div>


                            {/* =============================
                                PROFILE FIELDS
                            ============================= */}

                            <div className="customer-profile-fields">


                                <ProfileField
                                    icon={
                                        <User />
                                    }
                                    label={
                                        text.fullName
                                    }
                                >

                                    <input
                                        value={
                                            fullName
                                        }
                                        onChange={
                                            event =>
                                                setFullName(
                                                    event.target.value
                                                )
                                        }
                                        placeholder={
                                            text.fullNamePlaceholder
                                        }
                                        required
                                    />

                                </ProfileField>


                                <ProfileField
                                    icon={
                                        <UserRound />
                                    }
                                    label={
                                        text.username
                                    }
                                    help={
                                        text.usernameHelp
                                    }
                                >

                                    <input
                                        value={
                                            username
                                        }
                                        onChange={
                                            event =>
                                                setUsername(
                                                    event.target.value
                                                )
                                        }
                                        placeholder={
                                            text.usernamePlaceholder
                                        }
                                        maxLength={30}
                                        autoComplete="username"
                                    />

                                </ProfileField>


                                <ProfileField
                                    icon={
                                        <Phone />
                                    }
                                    label={
                                        text.phone
                                    }
                                >

                                    <input
                                        value={
                                            phone
                                        }
                                        onChange={
                                            event =>
                                                setPhone(
                                                    event.target.value
                                                )
                                        }
                                        placeholder={
                                            text.phonePlaceholder
                                        }
                                        type="tel"
                                        dir="ltr"
                                    />

                                </ProfileField>


                                <ProfileField
                                    icon={
                                        <Mail />
                                    }
                                    label={
                                        text.email
                                    }
                                    help={
                                        text.emailCannotChange
                                    }
                                >

                                    <input
                                        value={
                                            user?.email ||
                                            ""
                                        }
                                        readOnly
                                        dir="ltr"
                                    />

                                </ProfileField>


                                <ProfileField
                                    icon={
                                        <ShieldCheck />
                                    }
                                    label={
                                        text.accountRole
                                    }
                                >

                                    <input
                                        value={
                                            roleLabel(
                                                profile?.role
                                            )
                                        }
                                        readOnly
                                    />

                                </ProfileField>

                            </div>


                            <button
                                type="submit"
                                className="customer-profile-save"
                                disabled={
                                    saving ||
                                    uploading
                                }
                            >

                                <Save
                                    size={18}
                                />

                                {
                                    saving
                                        ? text.saving
                                        : text.saveProfile
                                }

                            </button>

                        </form>

                    </div>


                    {/* =====================================
                        PASSWORD
                    ===================================== */}

                    <form
                        className="customer-profile-card security"
                        onSubmit={
                            updatePassword
                        }
                    >

                        <div className="customer-profile-section-heading">

                            <LockKeyhole
                                size={21}
                            />

                            <div>

                                <span>
                                    {text.security}
                                </span>

                                <h2>
                                    {text.changePassword}
                                </h2>

                                <p>
                                    {text.passwordDescription}
                                </p>

                            </div>

                        </div>


                        {
                            passwordSuccess && (

                                <div className="customer-profile-message success">

                                    <Check
                                        size={16}
                                    />

                                    {
                                        passwordSuccess
                                    }

                                </div>

                            )
                        }


                        {
                            passwordError && (

                                <div className="customer-profile-message error">

                                    {
                                        passwordError
                                    }

                                </div>

                            )
                        }


                        <PasswordField
                            label={
                                text.currentPassword
                            }
                            placeholder={
                                text.currentPasswordPlaceholder
                            }
                            value={
                                currentPassword
                            }
                            onChange={
                                setCurrentPassword
                            }
                            visible={
                                showCurrentPassword
                            }
                            setVisible={
                                setShowCurrentPassword
                            }
                            text={
                                text
                            }
                            autoComplete="current-password"
                        />


                        <PasswordField
                            label={
                                text.newPassword
                            }
                            placeholder={
                                text.newPasswordPlaceholder
                            }
                            value={
                                newPassword
                            }
                            onChange={
                                setNewPassword
                            }
                            visible={
                                showNewPassword
                            }
                            setVisible={
                                setShowNewPassword
                            }
                            text={
                                text
                            }
                            autoComplete="new-password"
                        />


                        <PasswordField
                            label={
                                text.confirmPassword
                            }
                            placeholder={
                                text.confirmPasswordPlaceholder
                            }
                            value={
                                confirmPassword
                            }
                            onChange={
                                setConfirmPassword
                            }
                            visible={
                                showNewPassword
                            }
                            setVisible={
                                setShowNewPassword
                            }
                            text={
                                text
                            }
                            autoComplete="new-password"
                        />


                        <button
                            type="submit"
                            className="customer-profile-password-button"
                            disabled={
                                passwordLoading
                            }
                        >

                            <LockKeyhole
                                size={18}
                            />

                            {
                                passwordLoading
                                    ? text.updatingPassword
                                    : text.updatePassword
                            }

                        </button>

                    </form>

                </div>

            </div>


            {/* =============================================
                IMAGE CROPPER MODAL
            ============================================= */}

            {
                cropImageSource && (

                    <ProfileImageCropper
                        image={
                            cropImageSource
                        }
                        onCancel={
                            cancelCrop
                        }
                        onSave={
                            saveCroppedAvatar
                        }
                    />

                )
            }

        </main>

    );

}


/*
========================================================
INTERACTIVE ID CARD
========================================================
*/

function InteractiveIdCard({

    fullName,
    phone,
    email,
    avatarUrl,
    initials,
    role,
    text

}) {

    const [
        transformStyle,
        setTransformStyle
    ] = useState({

        transform:
            "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",

        "--pointer-x":
            "50%",

        "--pointer-y":
            "50%"

    });


    const handleMouseMove =
        event => {

            const rect =
                event.currentTarget
                    .getBoundingClientRect();


            const x =
                event.clientX -
                rect.left;


            const y =
                event.clientY -
                rect.top;


            const percentX =
                (
                    x /
                    rect.width
                ) *
                100;


            const percentY =
                (
                    y /
                    rect.height
                ) *
                100;


            const rotateY =
                (
                    (
                        percentX -
                        50
                    ) /
                    50
                ) *
                8;


            const rotateX =
                (
                    (
                        50 -
                        percentY
                    ) /
                    50
                ) *
                8;


            setTransformStyle({

                transform:
                    `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,

                "--pointer-x":
                    `${percentX}%`,

                "--pointer-y":
                    `${percentY}%`

            });

        };


    const resetCard =
        () => {

            setTransformStyle({

                transform:
                    "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",

                "--pointer-x":
                    "50%",

                "--pointer-y":
                    "50%"

            });

        };


    return (

        <div
            className="customer-id-card-wrap"
            onMouseMove={
                handleMouseMove
            }
            onMouseLeave={
                resetCard
            }
        >

            <div
                className="customer-id-card"
                style={
                    transformStyle
                }
            >

                <div className="customer-id-card-glow">
                </div>


                <div className="customer-id-card-top">

                    <div>

                        <span className="mini-label">

                            {
                                text.memberCard
                            }

                        </span>


                        <h3>

                            Nabil Pharmacy

                        </h3>

                    </div>


                    <div className="customer-id-card-role">

                        {
                            role
                        }

                    </div>

                </div>


                <div className="customer-id-card-main">

                    <div className="customer-id-card-avatar">

                        {
                            avatarUrl
                                ? (

                                    <img
                                        src={
                                            avatarUrl
                                        }
                                        alt={
                                            fullName
                                        }
                                    />

                                )
                                : (

                                    <strong>

                                        {
                                            initials
                                        }

                                    </strong>

                                )
                        }

                    </div>


                    <div className="customer-id-card-details">

                        <h4>

                            {
                                fullName ||
                                "Nabil Pharmacy User"
                            }

                        </h4>


                        <p className="customer-id-card-phone">

                            <Phone
                                size={15}
                            />


                            <span>

                                {
                                    phone ||
                                    text.noPhoneYet
                                }

                            </span>

                        </p>


                        <p className="customer-id-card-email">

                            <Mail
                                size={15}
                            />


                            <span>

                                {
                                    email
                                }

                            </span>

                        </p>

                    </div>

                </div>


                <div className="customer-id-card-bottom">

                    <div>

                        <span className="mini-label">

                            {
                                text.accountRole
                            }

                        </span>


                        <strong>

                            {
                                role
                            }

                        </strong>

                    </div>


                    <div>

                        <span className="mini-label">

                            {
                                text.memberSince
                            }

                        </span>


                        <strong>

                            1975

                        </strong>

                    </div>

                </div>

            </div>

        </div>

    );

}


/*
========================================================
PROFILE FIELD
========================================================
*/

function ProfileField({

    icon,
    label,
    help,
    children

}) {

    return (

        <div className="customer-profile-field">

            <label>
                {label}
            </label>


            <div className="customer-profile-input">

                {icon}

                {children}

            </div>


            {
                help && (

                    <small>
                        {help}
                    </small>

                )
            }

        </div>

    );

}


/*
========================================================
PASSWORD FIELD
========================================================
*/

function PasswordField({

    label,
    placeholder,
    value,
    onChange,
    visible,
    setVisible,
    text,
    autoComplete

}) {

    return (

        <div className="customer-profile-field">

            <label>
                {label}
            </label>


            <div className="customer-profile-input">

                <LockKeyhole
                    size={17}
                />


                <input
                    type={
                        visible
                            ? "text"
                            : "password"
                    }
                    value={
                        value
                    }
                    onChange={
                        event =>
                            onChange(
                                event.target.value
                            )
                    }
                    placeholder={
                        placeholder
                    }
                    dir="ltr"
                    autoComplete={
                        autoComplete
                    }
                />


                <button
                    type="button"
                    className="customer-profile-password-toggle"
                    onClick={() =>
                        setVisible(
                            current =>
                                !current
                        )
                    }
                    aria-label={
                        visible
                            ? text.hidePassword
                            : text.showPassword
                    }
                >

                    {
                        visible
                            ? (
                                <EyeOff
                                    size={17}
                                />
                            )
                            : (
                                <Eye
                                    size={17}
                                />
                            )
                    }

                </button>

            </div>

        </div>

    );

}


export default CustomerProfile;