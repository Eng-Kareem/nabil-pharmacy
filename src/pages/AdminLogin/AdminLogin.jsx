import {
    Eye,
    EyeOff,
    LockKeyhole,
    LogIn,
    ShieldCheck
} from "lucide-react";

import {
    motion
} from "framer-motion";

import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    supabase
} from "../../lib/supabase.js";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import "./AdminLogin.css";


function AdminLogin() {

    const navigate =
        useNavigate();


    const {
        isArabic
    } = useLanguage();


    const [
        email,
        setEmail
    ] = useState("");


    const [
        password,
        setPassword
    ] = useState("");


    const [
        showPassword,
        setShowPassword
    ] = useState(false);


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const text =
        isArabic
            ? {

                secureAdministration:
                    "إدارة آمنة",

                pharmacy:
                    "صيدلية نبيل",

                title:
                    "تسجيل دخول المسؤول",

                description:
                    "سجل الدخول باستخدام حساب مسؤول مصرح له بإدارة الصيدلية.",

                email:
                    "البريد الإلكتروني",

                emailPlaceholder:
                    "admin@example.com",

                password:
                    "كلمة المرور",

                passwordPlaceholder:
                    "أدخل كلمة المرور",

                hidePassword:
                    "إخفاء كلمة المرور",

                showPassword:
                    "إظهار كلمة المرور",

                invalidLogin:
                    "البريد الإلكتروني أو كلمة المرور غير صحيحة.",

                verificationError:
                    "تعذر التحقق من حساب المسؤول.",

                noAdminAccess:
                    "هذا الحساب لا يمتلك صلاحيات المسؤول.",

                generalError:
                    "حدث خطأ أثناء تسجيل الدخول.",

                checking:
                    "جاري التحقق من الصلاحيات...",

                enterDashboard:
                    "الدخول إلى لوحة الإدارة",

                security:
                    "يتم التحقق من الصلاحيات باستخدام نظام مصادقة Supabase ودور المستخدم في قاعدة البيانات."

            }
            : {

                secureAdministration:
                    "Secure Administration",

                pharmacy:
                    "Nabil Pharmacy",

                title:
                    "Administrator Login",

                description:
                    "Sign in with an authorized pharmacy administrator account.",

                email:
                    "Email Address",

                emailPlaceholder:
                    "admin@example.com",

                password:
                    "Password",

                passwordPlaceholder:
                    "Enter your password",

                hidePassword:
                    "Hide password",

                showPassword:
                    "Show password",

                invalidLogin:
                    "Invalid email or password.",

                verificationError:
                    "We could not verify this administrator account.",

                noAdminAccess:
                    "This account does not have administrator access.",

                generalError:
                    "Something went wrong while signing in.",

                checking:
                    "Checking Access...",

                enterDashboard:
                    "Enter Admin Dashboard",

                security:
                    "Access is verified using Supabase Authentication and your database role."

            };


    /*
    ========================================================
    ADMIN ROLE CHECK
    ========================================================

    BOTH of these roles may access the admin dashboard:

    admin
    super_admin
    */

    const hasAdminAccess = (
        role
    ) => {

        return (
            role === "admin" ||
            role === "super_admin"
        );

    };


    /*
    ========================================================
    EXISTING SESSION
    ========================================================
    */

    useEffect(
        () => {

            let active =
                true;


            const checkExistingSession =
                async () => {

                    try {

                        const {
                            data: {
                                user
                            }
                        } =
                            await supabase
                                .auth
                                .getUser();


                        if (
                            !user ||
                            !active
                        ) {

                            return;

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
                                    user.id
                                )
                                .single();


                        if (
                            profileError
                        ) {

                            console.error(
                                "Existing admin session check error:",
                                profileError
                            );

                            return;

                        }


                        if (
                            active &&
                            hasAdminAccess(
                                profile?.role
                            )
                        ) {

                            navigate(
                                "/admin",
                                {
                                    replace:
                                        true
                                }
                            );

                        }

                    } catch (
                        sessionError
                    ) {

                        console.error(
                            "Admin session check error:",
                            sessionError
                        );

                    }

                };


            checkExistingSession();


            return () => {

                active =
                    false;

            };

        },
        [
            navigate
        ]
    );


    /*
    ========================================================
    LOGIN
    ========================================================
    */

    const handleSubmit =
        async (
            event
        ) => {

            event.preventDefault();


            if (
                loading
            ) {

                return;

            }


            setLoading(
                true
            );


            setError(
                ""
            );


            try {

                /*
                ============================================
                AUTHENTICATE
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
                                    .trim(),

                            password

                        });


                if (
                    loginError
                ) {

                    setError(
                        text.invalidLogin
                    );

                    return;

                }


                const user =
                    data?.user;


                if (
                    !user
                ) {

                    setError(
                        text.verificationError
                    );

                    return;

                }


                /*
                ============================================
                LOAD DATABASE ROLE
                ============================================
                */

                const {
                    data: profile,
                    error:
                        profileError
                } =
                    await supabase
                        .from(
                            "profiles"
                        )
                        .select(`
                            id,
                            full_name,
                            role
                        `)
                        .eq(
                            "id",
                            user.id
                        )
                        .single();


                if (
                    profileError
                ) {

                    console.error(
                        "Admin profile verification error:",
                        profileError
                    );


                    await supabase
                        .auth
                        .signOut();


                    setError(
                        text.verificationError
                    );

                    return;

                }


                /*
                ============================================
                ADMIN / SUPER ADMIN ACCESS
                ============================================
                */

                if (
                    !hasAdminAccess(
                        profile?.role
                    )
                ) {

                    await supabase
                        .auth
                        .signOut();


                    setError(
                        text.noAdminAccess
                    );

                    return;

                }


                /*
                ============================================
                SUCCESS
                ============================================
                */

                navigate(
                    "/admin",
                    {
                        replace:
                            true
                    }
                );

            } catch (
                loginException
            ) {

                console.error(
                    "Admin login error:",
                    loginException
                );


                setError(
                    text.generalError
                );

            } finally {

                setLoading(
                    false
                );

            }

        };


    return (

        <main
            className="admin-login-page"
            dir={
                isArabic
                    ? "rtl"
                    : "ltr"
            }
        >

            <motion.div
                className="admin-login-card"
                initial={{
                    opacity:
                        0,

                    y:
                        25,

                    scale:
                        0.98
                }}
                animate={{
                    opacity:
                        1,

                    y:
                        0,

                    scale:
                        1
                }}
                transition={{
                    duration:
                        0.45
                }}
            >


                {/* =========================================
                    BRAND
                ========================================= */}

                <div className="admin-login-brand">

                    <img
                        src="/nabil-logo.png"
                        alt={
                            text.pharmacy
                        }
                    />


                    <div>

                        <span>

                            {
                                text.secureAdministration
                            }

                        </span>


                        <h1>

                            {
                                text.pharmacy
                            }

                        </h1>

                    </div>

                </div>


                {/* =========================================
                    HEADING
                ========================================= */}

                <div className="admin-login-heading">

                    <div className="admin-login-shield">

                        <ShieldCheck
                            size={25}
                        />

                    </div>


                    <h2>

                        {
                            text.title
                        }

                    </h2>


                    <p>

                        {
                            text.description
                        }

                    </p>

                </div>


                {/* =========================================
                    FORM
                ========================================= */}

                <form
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div className="admin-login-field">

                        <label
                            htmlFor="admin-email"
                        >

                            {
                                text.email
                            }

                        </label>


                        <div>

                            <LogIn
                                size={18}
                            />


                            <input
                                id="admin-email"
                                type="email"
                                value={
                                    email
                                }
                                onChange={
                                    event =>
                                        setEmail(
                                            event.target.value
                                        )
                                }
                                placeholder={
                                    text.emailPlaceholder
                                }
                                autoComplete="email"
                                dir="ltr"
                                required
                            />

                        </div>

                    </div>


                    <div className="admin-login-field">

                        <label
                            htmlFor="admin-password"
                        >

                            {
                                text.password
                            }

                        </label>


                        <div>

                            <LockKeyhole
                                size={18}
                            />


                            <input
                                id="admin-password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={
                                    password
                                }
                                onChange={
                                    event =>
                                        setPassword(
                                            event.target.value
                                        )
                                }
                                placeholder={
                                    text.passwordPlaceholder
                                }
                                autoComplete="current-password"
                                dir="ltr"
                                required
                            />


                            <button
                                type="button"
                                className="admin-password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        current =>
                                            !current
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? text.hidePassword
                                        : text.showPassword
                                }
                            >

                                {
                                    showPassword
                                        ? (

                                            <EyeOff
                                                size={18}
                                            />

                                        )
                                        : (

                                            <Eye
                                                size={18}
                                            />

                                        )
                                }

                            </button>

                        </div>

                    </div>


                    {
                        error && (

                            <div className="admin-login-error">

                                {
                                    error
                                }

                            </div>

                        )
                    }


                    <button
                        type="submit"
                        className="admin-login-button"
                        disabled={
                            loading
                        }
                    >

                        <ShieldCheck
                            size={19}
                        />


                        {
                            loading
                                ? text.checking
                                : text.enterDashboard
                        }

                    </button>

                </form>


                {/* =========================================
                    SECURITY MESSAGE
                ========================================= */}

                <div className="admin-login-security">

                    <ShieldCheck
                        size={16}
                    />


                    <span>

                        {
                            text.security
                        }

                    </span>

                </div>

            </motion.div>

        </main>

    );

}


export default AdminLogin;