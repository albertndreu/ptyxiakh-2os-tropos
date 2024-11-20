import React, { useState } from 'react';
import axios from 'axios';

const ValidateDocument = () => {
    const [hash, setHash] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationResult, setValidationResult] = useState(null);

    const handleValidation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setValidationResult(null);

    try {
        // Send a request to the blockchain server to validate the document
        const response = await axios.get(`http://localhost:5000/get_document/${hash}`);
        console.log('Validation response:', response.data); // Log the response for debugging

        if (response.data.message === 'Document found') {
            // Request the certificate
            const certificateResponse = await axios.get(`http://localhost:5000/generate_certificate/${hash}`, {
                responseType: 'blob', // Important for downloading files
            });

            // Create a URL for the PDF and trigger download
            const url = window.URL.createObjectURL(new Blob([certificateResponse.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${hash}_certificate.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        }

        setValidationResult(response.data);
    } catch (error) {
        console.error('Error validating document:', error);
        setValidationResult({ success: false, message: 'Error occurred during validation.' });
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="validate-document-container">
            <h2>Validate Document</h2>
            <form onSubmit={handleValidation} className="validate-document-form">
                <input
                    type="text"
                    value={hash}
                    onChange={(e) => setHash(e.target.value)}
                    placeholder="Enter document hash..."
                    className="validate-document-input"
                />
                <button type="submit" className="validate-document-button" disabled={loading}>
                    {loading ? 'Validating...' : 'Validate Document'}
                </button>
            </form>
            {validationResult && validationResult.message && (
                <p className={validationResult.success ? 'success-message' : 'error-message'}>
                    {validationResult.message}
                </p>
            )}
        </div>
    );
};

export default ValidateDocument;