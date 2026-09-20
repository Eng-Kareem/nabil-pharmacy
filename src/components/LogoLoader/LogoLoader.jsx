import "./LogoLoader.css";


function LogoLoader({
    text = "Loading...",
    small = false
}) {

    return (

        <div
            className={
                small
                    ? "logo-loader logo-loader-small"
                    : "logo-loader"
            }
            role="status"
            aria-live="polite"
        >

            <div className="logo-loader-animation">


                {/* =====================================
                    OUTER RING
                ===================================== */}

                <div className="logo-loader-ring logo-loader-ring-one">
                </div>



                {/* =====================================
                    INNER RING
                ===================================== */}

                <div className="logo-loader-ring logo-loader-ring-two">
                </div>



                {/* =====================================
                    GLOW
                ===================================== */}

                <div className="logo-loader-glow">
                </div>



                {/* =====================================
                    LOGO
                ===================================== */}

                <div className="logo-loader-logo-box">

                    <img
                        src="/nabil-logo.png"
                        alt=""
                        className="logo-loader-logo"
                    />

                </div>



                {/* =====================================
                    MEDICAL PARTICLES
                ===================================== */}

                <span
                    className="logo-loader-cross logo-loader-cross-one"
                    aria-hidden="true"
                >
                    +
                </span>


                <span
                    className="logo-loader-cross logo-loader-cross-two"
                    aria-hidden="true"
                >
                    +
                </span>


                <span
                    className="logo-loader-cross logo-loader-cross-three"
                    aria-hidden="true"
                >
                    +
                </span>

            </div>



            {/* =====================================
                TEXT
            ===================================== */}

            <div className="logo-loader-text">

                <strong>
                    {text}
                </strong>


                <div
                    className="logo-loader-dots"
                    aria-hidden="true"
                >

                    <span>
                    </span>

                    <span>
                    </span>

                    <span>
                    </span>

                </div>

            </div>


            <span className="logo-loader-brand">
                Nabil Pharmacy
            </span>

        </div>
    );
}


export default LogoLoader;