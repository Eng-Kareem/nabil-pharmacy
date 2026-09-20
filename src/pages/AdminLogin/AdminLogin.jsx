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

import "./AdminLogin.css";


function AdminLogin() {

    const navigate =
        useNavigate();


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


    /*
        If an admin is already logged in,
        send them directly to dashboard.
    */

    useEffect(() => {

        const checkExistingSession =
            async () => {

                const {
                    data: {
                        user
                    }
                } =
                    await supabase.auth.getUser();


                if (!user) {
                    return;
                }


                const {
                    data: profile
                } =
                    await supabase
                        .from("profiles")
                        .select("role")
                        .eq(
                            "id",
                            user.id
                        )
                        .single();


                if (
                    profile?.role ===
                    "admin"
                ) {

                    navigate(
                        "/admin",
                        {
                            replace: true
                        }
                    );
                }

            };


        checkExistingSession();

    }, [
        navigate
    ]);


    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setLoading(true);
        setError("");


        try {

            const {
                data,
                error:
                    loginError
            } =
                await supabase.auth
                    .signInWithPassword({
                        email:
                            email.trim(),

                        password
                    });


            if (loginError) {

                setError(
                    "Invalid email or password."
                );

                return;
            }


            const user =
                data.user;


            const {
                data: profile,
                error:
                    profileError
            } =
                await supabase
                    .from("profiles")
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


            if (profileError) {

                await supabase.auth
                    .signOut();


                setError(
                    "We could not verify this administrator account."
                );

                return;
            }


            if (
                profile.role !==
                "admin"
            ) {

                await supabase.auth
                    .signOut();


                setError(
                    "This account does not have administrator access."
                );

                return;
            }


            navigate(
                "/admin",
                {
                    replace: true
                }
            );

        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );


            setError(
                "Something went wrong while signing in."
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <main className="admin-login-page">

            <motion.div
                className="admin-login-card"
                initial={{
                    opacity: 0,
                    y: 25,
                    scale: 0.98
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1
                }}
                transition={{
                    duration: 0.45
                }}
            >

                <div className="admin-login-brand">

                    <img
                        src="/nabil-logo.png"
                        alt="Nabil Pharmacy"
                    />


                    <div>

                        <span>
                            Secure Administration
                        </span>

                        <h1>
                            Nabil Pharmacy
                        </h1>

                    </div>

                </div>


                <div className="admin-login-heading">

                    <div className="admin-login-shield">

                        <ShieldCheck
                            size={25}
                        />

                    </div>


                    <h2>
                        Administrator Login
                    </h2>


                    <p>
                        Sign in with an authorized
                        pharmacy administrator account.
                    </p>

                </div>


                <form
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div className="admin-login-field">

                        <label htmlFor="admin-email">
                            Email Address
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
                                placeholder="admin@example.com"
                                autoComplete="email"
                                required
                            />

                        </div>

                    </div>


                    <div className="admin-login-field">

                        <label htmlFor="admin-password">
                            Password
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
                                placeholder="Enter your password"
                                autoComplete="current-password"
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
                                        ? "Hide password"
                                        : "Show password"
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

                                {error}

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
                                ? "Checking Access..."
                                : "Enter Admin Dashboard"
                        }

                    </button>

                </form>


                <div className="admin-login-security">

                    <ShieldCheck
                        size={16}
                    />

                    <span>
                        Access is verified using
                        Supabase Authentication and
                        your database role.
                    </span>

                </div>

            </motion.div>

        </main>
    );
}


export default AdminLogin;