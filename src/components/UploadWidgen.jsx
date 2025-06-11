import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export default function UploadWidget({ setPicture, className }) {
    const cloudinaryRef = useRef();
    const widgetRef = useRef();
    const [uploadedImages, setUploadedImages] = useState([]);

    useEffect(() => {
        cloudinaryRef.current = window.cloudinary;
        widgetRef.current = cloudinaryRef.current.createUploadWidget({
            cloudName: 'dyikt4p59',
            uploadPreset: 'ml_default',
            maxFiles: 2,
            multiple: true,
        }, function (error, result) {
            if (result?.event === 'success') {
                const newImage = result.info.secure_url;

                setUploadedImages(prev => {
                    const updated = [...prev, newImage].slice(0, 2);
                    setPicture(updated);
                    return updated;
                });

                console.log(result.info.secure_url);
            }
        });
    }, [setPicture]);

    const handleDelete = (indexToDelete) => {
        const updated = uploadedImages.filter((_, index) => index !== indexToDelete);
        setUploadedImages(updated);
        setPicture(updated);
    };

    return (
        <div>
            <button
                type="button"
                className={`transition-all  mt-4 duration-75 bg-blue-600 hover:bg-blue-700 px-5 py-1 text-white rounded-md ${className}`}
                onClick={() => widgetRef.current.open()}
            >
                Upload picture
            </button>

            <div className="mt-4 grid grid-cols-2 gap-4">
                {uploadedImages.map((url, index) => (
                    <div key={index} className="relative group">
                        <img
                            src={url}
                            alt={`Uploaded ${index + 1}`}
                            className="rounded-lg object-cover shadow-sm w-full h-[20rem]"
                        />
                        <button
                            onClick={() => handleDelete(index)}
                            type="button"
                            className="absolute right-3 top-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-opacity opacity-80 hover:opacity-100"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
