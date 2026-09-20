import "./WebsiteLoader.css";


function WebsiteLoader({
    leaving = false
}) {

    return (

        <div
            className={
                leaving
                    ? "website-loader website-loader-leaving"
                    : "website-loader"
            }
        >

            {/* =================================================
                BACKGROUND DECORATIONS
            ================================================= */}

            <div className="website-loader-orb loader-orb-one">
            </div>


            <div className="website-loader-orb loader-orb-two">
            </div>



            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="website-loader-content">


                {/* =============================================
                    LOGO
                ============================================= */}

                <div className="website-loader-logo-area">


                    {/* OUTER ROTATING RING */}

                    <div className="website-loader-ring website-loader-ring-outer">
                    </div>



                    {/* SECOND RING */}

                    <div className="website-loader-ring website-loader-ring-inner">
                    </div>



                    {/* LOGO CONTAINER */}

                    <div className="website-loader-logo-container">

                        <img
                            src="/nabil-logo.png"
                            alt="Nabil Pharmacy"
                            className="website-loader-logo"
                        />

                    </div>



                    {/* PULSE */}

                    <div className="website-loader-pulse">
                    </div>

                </div>



                {/* =============================================
                    BRAND
                ============================================= */}

                <div className="website-loader-brand">

                    <span className="website-loader-small-title">
                        Welcome to
                    </span>


                    <h1>
                        Nabil Pharmacy
                    </h1>


                    <div className="website-loader-since">

                        <span>
                        </span>


                        <strong>
                            Since 1975
                        </strong>


                        <span>
                        </span>

                    </div>

                </div>



                {/* =============================================
                    LOADING DOTS
                ============================================= */}

                <div
                    className="website-loader-status"
                    aria-live="polite"
                >

                    <span>
                        Preparing your pharmacy
                    </span>


                    <div className="website-loader-dots">

                        <i>
                        </i>

                        <i>
                        </i>

                        <i>
                        </i>

                    </div>

                </div>


            </div>



            {/* =================================================
                BOTTOM TEXT
            ================================================= */}

            <div className="website-loader-bottom">

                <span>
                    NABIL PHARMACY
                </span>


                <span className="website-loader-bottom-dot">
                </span>


                <span>
                    H.O GROUP
                </span>

            </div>

        </div>
    );
}


export default WebsiteLoader;