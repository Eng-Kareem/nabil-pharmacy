import {
    ArrowLeft,
    Pill
} from "lucide-react";

import { Link } from "react-router-dom";


function NotFound() {
    return (
        <section className="not-found">

            <Pill size={48} />

            <span>
                404
            </span>

            <h1>
                Page not found
            </h1>

            <p>
                The page you're looking for
                does not exist.
            </p>

            <Link
                to="/"
                className="button primary-button"
            >
                <ArrowLeft size={18} />

                Return Home
            </Link>

        </section>
    );
}

export default NotFound;