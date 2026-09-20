import "./Footer.css";


function Footer() {

    return (
        <footer className="footer">

            <div className="footer-pattern">
            </div>


            <div className="container footer-inner">

                <div className="footer-brand">

                    <img
                        src="/nabil-logo.png"
                        alt="Nabil Pharmacy"
                    />


                    <div>

                        <strong>
                            Nabil Pharmacy
                        </strong>

                        <span>
                            صيدلية نبيل
                        </span>

                    </div>

                </div>


                <p>
                    © {new Date().getFullYear()}
                    {" "}
                    Nabil Pharmacy.
                    All rights reserved.
                </p>

            </div>

        </footer>
    );
}


export default Footer;