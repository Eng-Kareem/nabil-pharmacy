import {
    ArrowLeft,
    ArrowRight,
    Check,
    Eye,
    EyeOff,
    LockKeyhole,
    LogIn,
    LogOut,
    Mail,
    ShieldCheck,
    ShoppingBag,
    Signal,
    User,
    UserPlus,
    Wifi
} from "lucide-react";

import {
    useMemo,
    useState
} from "react";

import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";

import {
    motion
} from "framer-motion";

import {
    supabase
} from "../../lib/supabase.js";

import {
    useAuth
} from "../../context/AuthContext.jsx";

import "./CustomerAccount.css";


function CustomerAccount() {

    const {
        user,
        authLoading,
        signOut
    } = useAuth();


    const navigate =
        useNavigate();


    const [
        searchParams
    ] = useSearchParams();


    const [
        mode,
        setMode
    ] = useState(
        "login"
    );


    const [
        fullName,
        setFullName
    ] = useState(
        ""
    );


    const [
        email,
        setEmail
    ] = useState(
        ""
    );


    const [
        password,
        setPassword
    ] = useState(
        ""
    );


    const [
        confirmPassword,
        setConfirmPassword
    ] = useState(
        ""
    );


    const [
        showPassword,
        setShowPassword
    ] = useState(
        false
    );


    const [
        submitting,
        setSubmitting
    ] = useState(
        false
    );


    const [
        error,
        setError
    ] = useState(
        ""
    );


    const [
        success,
        setSuccess
    ] = useState(
        ""
    );


    /*
    ========================================================
    SAFE REDIRECT
    ========================================================
    */

    const redirectTo =
        useMemo(
            () => {

                const requested =
                    searchParams.get(
                        "redirect"
                    );


                if (
                    requested &&
                    requested.startsWith("/") &&
                    !requested.startsWith("//")
                ) {

                    return requested;

                }


                return "/";

            },
            [
                searchParams
            ]
        );


    /*
    ========================================================
    CUSTOMER REDIRECT
    ========================================================

    A customer must never be redirected into /admin merely
    because somebody manually added:

    ?redirect=/admin

    Admin authorization is still enforced by AdminRoute and
    RLS, but we also avoid bad frontend routing.
    */

    const customerRedirect =
        useMemo(
            () => {

                if (
                    redirectTo === "/admin" ||
                    redirectTo.startsWith(
                        "/admin/"
                    )
                ) {

                    return "/";

                }


                return redirectTo;

            },
            [
                redirectTo
            ]
        );


    /*
    ========================================================
    GET DESTINATION AFTER LOGIN
    ========================================================

    This is ONLY a navigation decision.

    Security is still enforced by:
    - Supabase Authentication
    - AdminRoute
    - PostgreSQL RLS

    Roles:
    customer     -> customer website
    admin        -> /admin
    super_admin  -> /admin
    */

    const getLoginDestination =
        async (
            signedInUser
        ) => {

            if (
                !signedInUser?.id
            ) {

                return customerRedirect;

            }


            const {
                data: profile,
                error: profileError
            } =
                await supabase
                    .from(
                        "profiles"
                    )
                    .select(
                        "role"
                    )
                    .eq(
                        "id",
                        signedInUser.id
                    )
                    .single();


            if (
                profileError
            ) {

                console.error(
                    "Account role verification error:",
                    profileError
                );


                throw new Error(
                    "We could not verify your account access."
                );

            }


            if (
                profile?.role ===
                    "admin" ||
                profile?.role ===
                    "super_admin"
            ) {

                return "/admin";

            }


            return customerRedirect;

        };


    /*
    ========================================================
    SWITCH LOGIN / SIGNUP
    ========================================================
    */

    const changeMode = (
        nextMode
    ) => {

        setError(
            ""
        );


        setSuccess(
            ""
        );


        setPassword(
            ""
        );


        setConfirmPassword(
            ""
        );


        setShowPassword(
            false
        );


        setMode(
            nextMode
        );

    };


    /*
    ========================================================
    LOGIN
    ========================================================
    */

    const handleLogin =
        async (
            event
        ) => {

            event.preventDefault();


            if (
                submitting
            ) {

                return;

            }


            setError(
                ""
            );


            setSuccess(
                ""
            );


            if (
                !email.trim()
            ) {

                setError(
                    "Please enter your email address."
                );


                return;

            }


            if (
                !password
            ) {

                setError(
                    "Please enter your password."
                );


                return;

            }


            setSubmitting(
                true
            );


            try {

                /*
                ============================================
                1. AUTHENTICATE
                ============================================
                */

                const {
                    data,
                    error:
                        loginError
                } =
                    await supabase
                        .auth
                        .signInWithPassword({

                            email:
                                email
                                    .trim()
                                    .toLowerCase(),

                            password

                        });


                if (
                    loginError
                ) {

                    throw loginError;

                }


                if (
                    !data?.user
                ) {

                    throw new Error(
                        "Login could not be completed."
                    );

                }


                /*
                ============================================
                2. REMOVE GUEST CHECKOUT MODE
                ============================================
                */

                sessionStorage.removeItem(
                    "nabil-checkout-guest"
                );


                /*
                ============================================
                3. CHECK DATABASE ROLE
                ============================================
                */

                const destination =
                    await getLoginDestination(
                        data.user
                    );


                /*
                ============================================
                4. REDIRECT
                ============================================
                */

                navigate(
                    destination,
                    {
                        replace:
                            true
                    }
                );

            } catch (
                loginError
            ) {

                console.error(
                    "Account login error:",
                    loginError
                );


                setError(
                    loginError?.message ||
                    "Unable to sign in."
                );

            } finally {

                setSubmitting(
                    false
                );

            }

        };


    /*
    ========================================================
    SIGNUP
    ========================================================

    IMPORTANT SECURITY RULE:

    Public registration NEVER creates an administrator.

    Your Supabase profile trigger assigns every new account:

    role = customer

    Admin promotion happens separately through the protected
    super-admin system.
    */

    const handleSignup =
        async (
            event
        ) => {

            event.preventDefault();


            if (
                submitting
            ) {

                return;

            }


            setError(
                ""
            );


            setSuccess(
                ""
            );


            if (
                !fullName.trim()
            ) {

                setError(
                    "Please enter your full name."
                );


                return;

            }


            if (
                !email.trim()
            ) {

                setError(
                    "Please enter your email address."
                );


                return;

            }


            if (
                password.length <
                8
            ) {

                setError(
                    "Your password must contain at least 8 characters."
                );


                return;

            }


            if (
                password !==
                confirmPassword
            ) {

                setError(
                    "The passwords do not match."
                );


                return;

            }


            setSubmitting(
                true
            );


            try {

                const {
                    data,
                    error:
                        signupError
                } =
                    await supabase
                        .auth
                        .signUp({

                            email:
                                email
                                    .trim()
                                    .toLowerCase(),

                            password,

                            options: {

                                data: {

                                    full_name:
                                        fullName
                                            .trim()

                                }

                            }

                        });


                if (
                    signupError
                ) {

                    throw signupError;

                }


                /*
                ============================================
                EMAIL CONFIRMATION DISABLED
                ============================================

                A new public account is always customer.

                Never redirect a newly registered user to
                /admin.
                */

                if (
                    data?.session
                ) {

                    sessionStorage.removeItem(
                        "nabil-checkout-guest"
                    );


                    navigate(
                        customerRedirect,
                        {
                            replace:
                                true
                        }
                    );


                    return;

                }


                /*
                ============================================
                EMAIL CONFIRMATION ENABLED
                ============================================
                */

                setMode(
                    "login"
                );


                setPassword(
                    ""
                );


                setConfirmPassword(
                    ""
                );


                setShowPassword(
                    false
                );


                setSuccess(
                    "Account created. Please confirm your email, then sign in."
                );

            } catch (
                signupError
            ) {

                console.error(
                    "Customer signup error:",
                    signupError
                );


                setError(
                    signupError?.message ||
                    "Unable to create your account."
                );

            } finally {

                setSubmitting(
                    false
                );

            }

        };


    /*
    ========================================================
    CONTINUE AS GUEST
    ========================================================
    */

    const continueAsGuest =
        () => {

            sessionStorage.setItem(
                "nabil-checkout-guest",
                "true"
            );


            navigate(
                customerRedirect,
                {
                    replace:
                        true
                }
            );

        };


    /*
    ========================================================
    LOGOUT
    ========================================================
    */

    const handleLogout =
        async () => {

            setError(
                ""
            );


            try {

                await signOut();

            } catch (
                logoutError
            ) {

                setError(
                    logoutError?.message ||
                    "Could not sign out."
                );

            }

        };


    /*
    ========================================================
    LOADING
    ========================================================
    */

    if (
        authLoading
    ) {

        return (

            <main className="customer-auth-page">

                <div className="customer-auth-loading">

                    <div className="customer-auth-loading-logo">

                        <img
                            src="/nabil-logo.png"
                            alt="Nabil Pharmacy"
                        />

                    </div>


                    <span>

                        Loading Nabil Pharmacy...

                    </span>

                </div>

            </main>

        );

    }


    /*
    ========================================================
    LOGGED-IN ACCOUNT

    Normally AccountPage now sends logged-in users to the
    profile page. This fallback is kept so the component is
    still safe if used somewhere else.
    ========================================================
    */

    if (
        user
    ) {

        const displayName =
            user.user_metadata
                ?.full_name ||
            user.email
                ?.split("@")[0] ||
            "Customer";


        return (

            <main className="customer-auth-page">

                <div className="customer-logged-layout">

                    <motion.section
                        className="customer-account-card"
                        initial={{
                            opacity:
                                0,

                            y:
                                20
                        }}
                        animate={{
                            opacity:
                                1,

                            y:
                                0
                        }}
                    >

                        <div className="customer-account-phone-icon">

                            <Check
                                size={27}
                            />

                        </div>


                        <span className="customer-auth-eyebrow">

                            Nabil Pharmacy

                        </span>


                        <h1>

                            Welcome, {displayName}

                        </h1>


                        <p>

                            You're signed in to your account.

                        </p>


                        <div className="customer-account-email">

                            <Mail
                                size={18}
                            />


                            <div>

                                <span>

                                    Signed in as

                                </span>


                                <strong>

                                    {
                                        user.email
                                    }

                                </strong>

                            </div>

                        </div>


                        <div className="customer-account-actions">

                            <Link
                                to={
                                    customerRedirect ===
                                    "/"
                                        ? "/products"
                                        : customerRedirect
                                }
                                className="customer-auth-primary"
                            >

                                <ShoppingBag
                                    size={18}
                                />


                                {
                                    customerRedirect ===
                                    "/checkout"
                                        ? "Continue to Checkout"
                                        : "Shop Products"
                                }

                            </Link>


                            <button
                                type="button"
                                className="customer-auth-secondary"
                                onClick={
                                    handleLogout
                                }
                            >

                                <LogOut
                                    size={17}
                                />

                                Sign Out

                            </button>

                        </div>


                        {
                            error && (

                                <div className="customer-auth-error">

                                    {
                                        error
                                    }

                                </div>

                            )
                        }

                    </motion.section>

                </div>

            </main>

        );

    }


    /*
    ========================================================
    LOGIN / SIGNUP PAGE
    ========================================================
    */

    return (

        <main className="customer-auth-page">

            <div className="customer-auth-layout">


                {/* =================================================
                    LEFT INTRO
                ================================================= */}

                <motion.section
                    className="customer-auth-intro"
                    initial={{
                        opacity:
                            0,

                        x:
                            -18
                    }}
                    animate={{
                        opacity:
                            1,

                        x:
                            0
                    }}
                    transition={{
                        duration:
                            0.45
                    }}
                >

                    <div className="customer-auth-mini-brand">

                        <span className="customer-auth-brand-line">
                        </span>


                        <span>

                            Nabil Pharmacy

                        </span>

                    </div>


                    <span className="customer-auth-intro-label">

                        Since 1975

                    </span>


                    <h1>

                        Your pharmacy

                        <br />

                        <strong>

                            in your pocket.

                        </strong>

                    </h1>


                    <p>

                        Secure access to your orders,
                        receipts and pharmacy services —
                        all from one simple account.

                    </p>


                    <div className="customer-auth-intro-points">

                        <div>

                            <Check
                                size={15}
                            />


                            <span>

                                Track your orders

                            </span>

                        </div>


                        <div>

                            <Check
                                size={15}
                            />


                            <span>

                                Access your receipts

                            </span>

                        </div>


                        <div>

                            <Check
                                size={15}
                            />


                            <span>

                                Faster future checkout

                            </span>

                        </div>

                    </div>


                    <div className="customer-auth-secure-note">

                        <ShieldCheck
                            size={17}
                        />


                        <div>

                            <strong>

                                Secure customer access

                            </strong>


                            <span>

                                Your account is protected by Supabase Authentication.

                            </span>

                        </div>

                    </div>

                </motion.section>


                {/* =================================================
                    INTERACTIVE IPHONE
                ================================================= */}

                <motion.section
                    className="customer-phone-stage"
                    initial={{
                        opacity:
                            0,

                        scale:
                            0.95,

                        y:
                            18
                    }}
                    animate={{
                        opacity:
                            1,

                        scale:
                            1,

                        y:
                            0
                    }}
                    transition={{
                        duration:
                            0.5,

                        delay:
                            0.05
                    }}
                >

                    <div className="customer-phone-caption">

                        <span>

                            {
                                mode ===
                                "login"
                                    ? "Customer Login"
                                    : "Create Account"
                            }

                        </span>


                        <span className="customer-phone-caption-dot">
                        </span>


                        <span>

                            Interactive

                        </span>

                    </div>


                    <div
                        className={
                            mode ===
                            "signup"
                                ? "customer-iphone flipped"
                                : "customer-iphone"
                        }
                    >

                        <div className="iphone-silent-button">
                        </div>

                        <div className="iphone-volume-up">
                        </div>

                        <div className="iphone-volume-down">
                        </div>

                        <div className="iphone-power-button">
                        </div>


                        <div className="customer-phone-flipper">


                            {/* =================================================
                                LOGIN FRONT
                            ================================================= */}

                            <section
                                className="iphone-face iphone-front"
                                aria-hidden={
                                    mode !==
                                    "login"
                                }
                            >

                                <PhoneChrome />


                                {
                                    mode ===
                                    "login" && (

                                        <LoginScreen

                                            email={
                                                email
                                            }

                                            setEmail={
                                                setEmail
                                            }

                                            password={
                                                password
                                            }

                                            setPassword={
                                                setPassword
                                            }

                                            showPassword={
                                                showPassword
                                            }

                                            setShowPassword={
                                                setShowPassword
                                            }

                                            submitting={
                                                submitting
                                            }

                                            error={
                                                error
                                            }

                                            success={
                                                success
                                            }

                                            onSubmit={
                                                handleLogin
                                            }

                                            onSignup={() =>
                                                changeMode(
                                                    "signup"
                                                )
                                            }

                                            onGuest={
                                                continueAsGuest
                                            }

                                        />

                                    )
                                }


                                <div className="iphone-home-indicator">
                                </div>

                            </section>


                            {/* =================================================
                                SIGNUP BACK
                            ================================================= */}

                            <section
                                className="iphone-face iphone-back"
                                aria-hidden={
                                    mode !==
                                    "signup"
                                }
                            >

                                <PhoneChrome />


                                {
                                    mode ===
                                    "signup" && (

                                        <SignupScreen

                                            fullName={
                                                fullName
                                            }

                                            setFullName={
                                                setFullName
                                            }

                                            email={
                                                email
                                            }

                                            setEmail={
                                                setEmail
                                            }

                                            password={
                                                password
                                            }

                                            setPassword={
                                                setPassword
                                            }

                                            confirmPassword={
                                                confirmPassword
                                            }

                                            setConfirmPassword={
                                                setConfirmPassword
                                            }

                                            showPassword={
                                                showPassword
                                            }

                                            setShowPassword={
                                                setShowPassword
                                            }

                                            submitting={
                                                submitting
                                            }

                                            error={
                                                error
                                            }

                                            onSubmit={
                                                handleSignup
                                            }

                                            onLogin={() =>
                                                changeMode(
                                                    "login"
                                                )
                                            }

                                            onGuest={
                                                continueAsGuest
                                            }

                                        />

                                    )
                                }


                                <div className="iphone-home-indicator">
                                </div>

                            </section>

                        </div>

                    </div>


                    <div className="customer-phone-shadow">
                    </div>

                </motion.section>

            </div>

        </main>

    );

}


/*
========================================================
LOGIN SCREEN
========================================================
*/

function LoginScreen({

    email,
    setEmail,

    password,
    setPassword,

    showPassword,
    setShowPassword,

    submitting,

    error,
    success,

    onSubmit,
    onSignup,
    onGuest

}) {

    return (

        <div className="iphone-screen-content">


            <PhoneBrand />


            <div className="iphone-auth-heading">

                <span>

                    Welcome Back

                </span>


                <h2>

                    Sign in

                </h2>


                <p>

                    Access your pharmacy account.

                </p>

            </div>


            {
                success && (

                    <div className="iphone-message success">

                        <Check
                            size={14}
                        />


                        <span>

                            {
                                success
                            }

                        </span>

                    </div>

                )
            }


            {
                error && (

                    <div className="iphone-message error">

                        {
                            error
                        }

                    </div>

                )
            }


            <form
                className="iphone-auth-form"
                onSubmit={
                    onSubmit
                }
            >

                <PhoneInput

                    id="login-email"

                    label="Email Address"

                    type="email"

                    autoComplete="email"

                    placeholder="you@example.com"

                    value={
                        email
                    }

                    onChange={
                        event =>
                            setEmail(
                                event.target.value
                            )
                    }

                    icon={
                        <Mail
                            size={16}
                        />
                    }

                />


                <PasswordInput

                    id="login-password"

                    label="Password"

                    autoComplete="current-password"

                    placeholder="Your password"

                    value={
                        password
                    }

                    onChange={
                        event =>
                            setPassword(
                                event.target.value
                            )
                    }

                    showPassword={
                        showPassword
                    }

                    setShowPassword={
                        setShowPassword
                    }

                />


                <button
                    type="submit"
                    className="iphone-main-button"
                    disabled={
                        submitting
                    }
                >

                    <LogIn
                        size={17}
                    />


                    {
                        submitting
                            ? "Signing In..."
                            : "Sign In"
                    }

                </button>

            </form>


            <div className="iphone-switch-section">

                <span>

                    New to Nabil Pharmacy?

                </span>


                <button
                    type="button"
                    onClick={
                        onSignup
                    }
                >

                    Create Account

                    <ArrowRight
                        size={15}
                    />

                </button>

            </div>


            <div className="iphone-or">

                <span>

                    OR

                </span>

            </div>


            <button
                type="button"
                className="iphone-guest-button"
                onClick={
                    onGuest
                }
            >

                <ShoppingBag
                    size={16}
                />

                Continue as Guest

            </button>


            <div className="iphone-security">

                <ShieldCheck
                    size={13}
                />

                Secure customer access

            </div>

        </div>

    );

}


/*
========================================================
SIGNUP SCREEN
========================================================
*/

function SignupScreen({

    fullName,
    setFullName,

    email,
    setEmail,

    password,
    setPassword,

    confirmPassword,
    setConfirmPassword,

    showPassword,
    setShowPassword,

    submitting,

    error,

    onSubmit,
    onLogin,
    onGuest

}) {

    return (

        <div className="iphone-screen-content signup-content">


            <PhoneBrand />


            <div className="iphone-auth-heading signup-heading">

                <span>

                    New Customer

                </span>


                <h2>

                    Create account

                </h2>


                <p>

                    Join Nabil Pharmacy in seconds.

                </p>

            </div>


            {
                error && (

                    <div className="iphone-message error">

                        {
                            error
                        }

                    </div>

                )
            }


            <form
                className="iphone-auth-form signup-form"
                onSubmit={
                    onSubmit
                }
            >

                <PhoneInput

                    id="signup-name"

                    label="Full Name"

                    type="text"

                    autoComplete="name"

                    placeholder="Your full name"

                    value={
                        fullName
                    }

                    onChange={
                        event =>
                            setFullName(
                                event.target.value
                            )
                    }

                    icon={
                        <User
                            size={16}
                        />
                    }

                />


                <PhoneInput

                    id="signup-email"

                    label="Email Address"

                    type="email"

                    autoComplete="email"

                    placeholder="you@example.com"

                    value={
                        email
                    }

                    onChange={
                        event =>
                            setEmail(
                                event.target.value
                            )
                    }

                    icon={
                        <Mail
                            size={16}
                        />
                    }

                />


                <PasswordInput

                    id="signup-password"

                    label="Password"

                    autoComplete="new-password"

                    placeholder="Minimum 8 characters"

                    value={
                        password
                    }

                    onChange={
                        event =>
                            setPassword(
                                event.target.value
                            )
                    }

                    showPassword={
                        showPassword
                    }

                    setShowPassword={
                        setShowPassword
                    }

                />


                <PhoneInput

                    id="signup-confirm-password"

                    label="Confirm Password"

                    type={
                        showPassword
                            ? "text"
                            : "password"
                    }

                    autoComplete="new-password"

                    placeholder="Repeat password"

                    value={
                        confirmPassword
                    }

                    onChange={
                        event =>
                            setConfirmPassword(
                                event.target.value
                            )
                    }

                    icon={
                        <LockKeyhole
                            size={16}
                        />
                    }

                />


                <button
                    type="submit"
                    className="iphone-main-button"
                    disabled={
                        submitting
                    }
                >

                    <UserPlus
                        size={17}
                    />


                    {
                        submitting
                            ? "Creating..."
                            : "Create Account"
                    }

                </button>

            </form>


            <div className="iphone-switch-section signup-switch">

                <span>

                    Already have an account?

                </span>


                <button
                    type="button"
                    onClick={
                        onLogin
                    }
                >

                    <ArrowLeft
                        size={15}
                    />

                    Back to Sign In

                </button>

            </div>


            <button
                type="button"
                className="iphone-guest-button signup-guest"
                onClick={
                    onGuest
                }
            >

                Continue as Guest

            </button>

        </div>

    );

}


/*
========================================================
PHONE BRAND
========================================================
*/

function PhoneBrand() {

    return (

        <div className="iphone-auth-brand">

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

    );

}


/*
========================================================
PHONE CHROME
========================================================
*/

function PhoneChrome() {

    return (

        <>

            <div className="iphone-status-bar">

                <span>

                    9:41

                </span>


                <div>

                    <Signal
                        size={12}
                    />


                    <Wifi
                        size={12}
                    />


                    <span className="iphone-battery">

                        <span>
                        </span>

                    </span>

                </div>

            </div>


            <div className="iphone-dynamic-island">

                <span className="iphone-island-camera">
                </span>

            </div>

        </>

    );

}


/*
========================================================
STANDARD INPUT
========================================================
*/

function PhoneInput({

    id,
    label,
    icon,
    ...inputProps

}) {

    return (

        <div className="iphone-form-field">

            <label
                htmlFor={
                    id
                }
            >

                {
                    label
                }

            </label>


            <div className="iphone-input-shell">

                {
                    icon
                }


                <input
                    id={
                        id
                    }
                    {...inputProps}
                />

            </div>

        </div>

    );

}


/*
========================================================
PASSWORD INPUT
========================================================
*/

function PasswordInput({

    id,
    label,

    showPassword,
    setShowPassword,

    ...inputProps

}) {

    return (

        <div className="iphone-form-field">

            <label
                htmlFor={
                    id
                }
            >

                {
                    label
                }

            </label>


            <div className="iphone-input-shell">

                <LockKeyhole
                    size={16}
                />


                <input
                    id={
                        id
                    }
                    type={
                        showPassword
                            ? "text"
                            : "password"
                    }
                    {...inputProps}
                />


                <button
                    type="button"
                    className="iphone-password-button"
                    onClick={() =>
                        setShowPassword(
                            current =>
                                !current
                        )
                    }
                    aria-label={
                        showPassword
                            ? "Hide password"
                            : "Show password"
                    }
                >

                    {
                        showPassword
                            ? (

                                <EyeOff
                                    size={16}
                                />

                            )
                            : (

                                <Eye
                                    size={16}
                                />

                            )
                    }

                </button>

            </div>

        </div>

    );

}


export default CustomerAccount;