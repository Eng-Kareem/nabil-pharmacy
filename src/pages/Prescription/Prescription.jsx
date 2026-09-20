import {
    CheckCircle2,
    FileText,
    LockKeyhole,
    ShieldCheck,
    Upload,
    X
} from "lucide-react";

import {
    AnimatePresence,
    motion,
    useReducedMotion
} from "framer-motion";

import {
    useRef,
    useState
} from "react";

import "./Prescription.css";


function Prescription() {
    const inputRef =
        useRef(null);

    const reducedMotion =
        useReducedMotion();

    const [file, setFile] =
        useState(null);

    const [submitted, setSubmitted] =
        useState(false);

    const [dragActive, setDragActive] =
        useState(false);


    const handleSelectedFile = (
        selectedFile
    ) => {

        if (!selectedFile) {
            return;
        }

        setFile(selectedFile);
        setSubmitted(false);
    };


    const handleInputChange = (
        event
    ) => {

        handleSelectedFile(
            event.target.files?.[0]
        );
    };


    const handleDragOver = (
        event
    ) => {

        event.preventDefault();

        setDragActive(true);
    };


    const handleDragLeave = () => {
        setDragActive(false);
    };


    const handleDrop = (
        event
    ) => {

        event.preventDefault();

        setDragActive(false);

        handleSelectedFile(
            event.dataTransfer.files?.[0]
        );
    };


    const handleSubmit = (
        event
    ) => {

        event.preventDefault();

        setSubmitted(true);
    };


    return (
        <main className="prescription-page">

            <div className="prescription-page-pattern">
            </div>


            <div className="container prescription-page-grid">

                <motion.section
                    className="prescription-page-copy"
                    initial={{
                        opacity: 0,
                        x:
                            reducedMotion
                                ? 0
                                : -35
                    }}
                    animate={{
                        opacity: 1,
                        x: 0
                    }}
                    transition={{
                        duration:
                            reducedMotion
                                ? 0
                                : 0.7
                    }}
                >

                    <span className="section-label">
                        Prescription Service
                    </span>


                    <h1>
                        Send your
                        <span>
                            {" "}prescription{" "}
                        </span>
                        online.
                    </h1>


                    <p>
                        A modern digital prescription
                        experience designed to make
                        communicating with Nabil Pharmacy
                        faster and easier.
                    </p>


                    <div className="prescription-security-list">

                        <div>

                            <ShieldCheck />

                            <span>
                                <strong>
                                    Secure architecture
                                </strong>

                                Protected customer files
                                when backend security is enabled.
                            </span>

                        </div>


                        <div>

                            <LockKeyhole />

                            <span>
                                <strong>
                                    Private access
                                </strong>

                                Prescriptions will not be
                                publicly accessible.
                            </span>

                        </div>


                        <div>

                            <FileText />

                            <span>
                                <strong>
                                    Pharmacy review
                                </strong>

                                Designed for a controlled
                                pharmacy workflow.
                            </span>

                        </div>

                    </div>

                </motion.section>


                <motion.form
                    className="prescription-form-card"
                    onSubmit={handleSubmit}
                    initial={{
                        opacity: 0,
                        y:
                            reducedMotion
                                ? 0
                                : 35
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        duration:
                            reducedMotion
                                ? 0
                                : 0.7,

                        delay:
                            reducedMotion
                                ? 0
                                : 0.1
                    }}
                >

                    <div className="prescription-form-heading">

                        <span>
                            Prescription Request
                        </span>

                        <h2>
                            Your details
                        </h2>

                    </div>


                    <div className="prescription-form-group">

                        <label htmlFor="patientName">
                            Full name
                        </label>

                        <input
                            id="patientName"
                            type="text"
                            placeholder="Enter your full name"
                            required
                        />

                    </div>


                    <div className="prescription-form-group">

                        <label htmlFor="patientPhone">
                            Phone number
                        </label>

                        <input
                            id="patientPhone"
                            type="tel"
                            placeholder="Enter your phone number"
                            required
                        />

                    </div>


                    <div className="prescription-form-group">

                        <label>
                            Prescription file
                        </label>


                        <motion.button
                            type="button"
                            className={
                                dragActive
                                    ? "prescription-upload-zone active"
                                    : "prescription-upload-zone"
                            }
                            onClick={() =>
                                inputRef.current?.click()
                            }
                            onDragOver={
                                handleDragOver
                            }
                            onDragLeave={
                                handleDragLeave
                            }
                            onDrop={
                                handleDrop
                            }
                            whileHover={{
                                scale: 1.01
                            }}
                        >

                            {!file ? (
                                <>
                                    <div className="upload-icon-circle">

                                        <Upload
                                            size={30}
                                        />

                                    </div>

                                    <strong>
                                        Upload prescription
                                    </strong>

                                    <span>
                                        Click or drag your file here
                                    </span>

                                    <small>
                                        JPG, PNG or PDF
                                    </small>
                                </>
                            ) : (
                                <div className="selected-prescription-file">

                                    <FileText />

                                    <div>
                                        <strong>
                                            {file.name}
                                        </strong>

                                        <span>
                                            File selected
                                        </span>
                                    </div>


                                    <button
                                        type="button"
                                        onClick={event => {
                                            event.stopPropagation();

                                            setFile(null);

                                            if (
                                                inputRef.current
                                            ) {
                                                inputRef.current.value =
                                                    "";
                                            }
                                        }}
                                        aria-label="Remove selected file"
                                    >
                                        <X size={18} />
                                    </button>

                                </div>
                            )}

                        </motion.button>


                        <input
                            ref={inputRef}
                            className="prescription-hidden-file"
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            onChange={handleInputChange}
                        />

                    </div>


                    <button
                        type="submit"
                        className="primary-button prescription-submit"
                        disabled={!file}
                    >

                        <Upload size={19} />

                        Submit Prescription

                    </button>


                    <AnimatePresence>

                        {submitted && (

                            <motion.div
                                className="prescription-demo-message"
                                initial={{
                                    opacity: 0,
                                    y: 10
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0
                                }}
                                exit={{
                                    opacity: 0
                                }}
                            >

                                <CheckCircle2 />

                                <div>

                                    <strong>
                                        Frontend test successful
                                    </strong>

                                    <span>
                                        Nothing was uploaded.
                                        Secure Supabase Storage
                                        will be connected later.
                                    </span>

                                </div>

                            </motion.div>

                        )}

                    </AnimatePresence>

                </motion.form>

            </div>

        </main>
    );
}


export default Prescription;