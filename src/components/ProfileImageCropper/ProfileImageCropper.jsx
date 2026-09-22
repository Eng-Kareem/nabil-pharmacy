import {
    Check,
    RotateCcw,
    X
} from "lucide-react";

import Cropper
    from "react-easy-crop";

import {
    useCallback,
    useState
} from "react";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import {
    getCroppedImage
} from "../../utils/cropImage.js";

import "./ProfileImageCropper.css";


function ProfileImageCropper({

    image,

    onCancel,

    onSave

}) {

    const {
        isArabic
    } = useLanguage();


    const [
        crop,
        setCrop
    ] = useState({
        x: 0,
        y: 0
    });


    const [
        zoom,
        setZoom
    ] = useState(
        1
    );


    const [
        croppedPixels,
        setCroppedPixels
    ] = useState(
        null
    );


    const [
        saving,
        setSaving
    ] = useState(
        false
    );


    const text =
        isArabic
            ? {

                title:
                    "تحديد صورة الحساب",

                description:
                    "حرّك الصورة وضع وجهك داخل الدائرة، واستخدم شريط التكبير للتحكم في الإطار.",

                zoom:
                    "التكبير",

                reset:
                    "إعادة الضبط",

                cancel:
                    "إلغاء",

                save:
                    "حفظ الصورة",

                saving:
                    "جاري حفظ الصورة..."

            }
            : {

                title:
                    "Position Your Profile Photo",

                description:
                    "Drag the photo until your face is positioned inside the circle. Use the zoom slider to adjust the frame.",

                zoom:
                    "Zoom",

                reset:
                    "Reset",

                cancel:
                    "Cancel",

                save:
                    "Save Photo",

                saving:
                    "Saving Photo..."

            };


    const handleCropComplete =
        useCallback(
            (
                croppedArea,
                croppedAreaPixels
            ) => {

                setCroppedPixels(
                    croppedAreaPixels
                );

            },
            []
        );


    const resetCrop = () => {

        setCrop({
            x: 0,
            y: 0
        });


        setZoom(
            1
        );

    };


    const saveCrop =
        async () => {

            if (
                !croppedPixels ||
                saving
            ) {

                return;

            }


            setSaving(
                true
            );


            try {

                const croppedBlob =
                    await getCroppedImage(
                        image,
                        croppedPixels
                    );


                await onSave(
                    croppedBlob
                );

            } catch (error) {

                console.error(
                    "Profile crop error:",
                    error
                );

            } finally {

                setSaving(
                    false
                );

            }

        };


    return (

        <div
            className="profile-crop-backdrop"
            dir={
                isArabic
                    ? "rtl"
                    : "ltr"
            }
        >

            <div className="profile-crop-modal">


                {/* HEADER */}

                <div className="profile-crop-header">

                    <div>

                        <h2>
                            {text.title}
                        </h2>

                        <p>
                            {text.description}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={
                            onCancel
                        }
                        className="profile-crop-close"
                    >

                        <X size={20} />

                    </button>

                </div>


                {/* CROPPER */}

                <div className="profile-crop-area">

                    <Cropper
                        image={
                            image
                        }
                        crop={
                            crop
                        }
                        zoom={
                            zoom
                        }
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        objectFit="contain"
                        onCropChange={
                            setCrop
                        }
                        onZoomChange={
                            setZoom
                        }
                        onCropComplete={
                            handleCropComplete
                        }
                    />

                </div>


                {/* ZOOM */}

                <div className="profile-crop-controls">

                    <label>

                        <span>
                            {text.zoom}
                        </span>


                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.01"
                            value={
                                zoom
                            }
                            onChange={
                                event =>
                                    setZoom(
                                        Number(
                                            event.target.value
                                        )
                                    )
                            }
                        />

                    </label>


                    <button
                        type="button"
                        className="profile-crop-reset"
                        onClick={
                            resetCrop
                        }
                    >

                        <RotateCcw
                            size={16}
                        />

                        {text.reset}

                    </button>

                </div>


                {/* BUTTONS */}

                <div className="profile-crop-actions">

                    <button
                        type="button"
                        className="profile-crop-cancel"
                        onClick={
                            onCancel
                        }
                        disabled={
                            saving
                        }
                    >

                        {text.cancel}

                    </button>


                    <button
                        type="button"
                        className="profile-crop-save"
                        onClick={
                            saveCrop
                        }
                        disabled={
                            saving
                        }
                    >

                        <Check
                            size={17}
                        />

                        {
                            saving
                                ? text.saving
                                : text.save
                        }

                    </button>

                </div>

            </div>

        </div>

    );

}


export default ProfileImageCropper;