import React, { useState } from "react";
import axios from "axios";
import "./Upload.css";

export default function Upload() {
    const [selectedImages, setSelectedImages] = useState([]);
    const [responseData, setResponseData] = useState(null);
    const [error, setError] = useState(null);

    const handleImageUpload = async () => {
        resetMessage();

        if (selectedImages.length > 5 || selectedImages.length === 0) {
            setError(["You can't upload the images"]);
            return;
        }

        const formData = new FormData();
        selectedImages.forEach((image) => {
            formData.append("images", image);
        });

        setSelectedImages([]);

        try {
            const response = await axios.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // if (response.data.status == 400) {
            //   console.log("In App.js : ", response.data.message);
            //   // setResponseData(response.data.warning);
            // }

            console.log(response.data); // Handle the response from the backend here
            setResponseData(response.data.message);
        } catch (err) {
            console.error("Error in App.js : ", err.response);
            setError(err.response.data.warning);
            setResponseData(err.response.data.message);
        }
    };

    const handleImageSelection = (event) => {
        resetMessage();
        const files = Array.from(event.target.files);
        if (files.length > 5) {
            setSelectedImages([]);
            setError(["You can't upload more than 5 images"]);
            return;
        }
        console.log("Files details : ", files);
        setSelectedImages(files);
    };

    const resetMessage = () => {
        setError(null);
        setResponseData(null);
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <label className="fancy" style={{ marginRight: "30px" }}>
                    <input
                        type="file"
                        accept=".png"
                        name="upload"
                        multiple
                        onChange={handleImageSelection}
                    />
                    {"Select Images"}
                </label>

                <button
                    className="fancy"
                    onClick={handleImageUpload}
                    style={{ marginRight: "30px" }}
                >
                    Upload and Check
                </button>
                <button
                    className="fancy"
                    onClick={() => {
                        resetMessage();
                        setSelectedImages([]);
                    }}
                >
                    Clear
                </button>
            </div>

            {selectedImages.length > 0 && (
                <div>
                    <h2>Selected Images:</h2>
                    <ol>
                        {selectedImages.map((image, index) => (
                            <li>{image.name}</li>
                        ))}
                    </ol>
                </div>
            )}
            {responseData && (
                <div style={{ color: "green" }}>
                    <h2>Result:</h2>
                    <p>Upload Succesful</p>
                    {responseData.map((message, index) => (
                        <li key={index}>{message}</li>
                    ))}
                </div>
            )}
            {error && (
                <div style={{ color: "red" }}>
                    <h2>Error</h2>
                    {error.map((err, index) => (
                        <li key={index}>{err}</li>
                    ))}
                </div>
            )}
        </div>
    );
}
