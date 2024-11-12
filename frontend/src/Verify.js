// src/components/SearchDocument.js
import React, { useState } from 'react';
import axios from 'axios';

function SearchDocument() {
    const [documentHash, setDocumentHash] = useState('');
    const [documentUrl, setDocumentUrl] = useState('');
    const [error, setError] = useState('');

    // Handle document hash input
    const handleInputChange = (e) => {
        setDocumentHash(e.target.value);
        setError('');
    };

    // Search document by hash
    const handleSearch = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("No authentication token found. Please log in again.");
                window.location.href = '/login';
                return;
            }

            const response = await axios.get(`http://localhost:5000/get_document/${documentHash}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });

            if (response.data) {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                setDocumentUrl(url);
            }
        } catch (err) {
            if (err.response?.status === 403) {
                alert("Authentication error. Please log in again.");
                window.location.href = '/login';
            } else {
                setError('Document not found. Please check the hash and try again.');
                setDocumentUrl('');
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Search Document by Hash</h2>
            <input
                type="text"
                value={documentHash}
                onChange={handleInputChange}
                placeholder="Enter Document Hash"
                style={{ marginRight: '10px', padding: '5px', width: '300px' }}
            />
            <button onClick={handleSearch} style={{ padding: '5px 10px' }}>Search</button>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            {documentUrl && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Document Found:</h3>
                    <a href={documentUrl} download={`Document-${documentHash}`}>
                        Download Document
                    </a>
                    <iframe src={documentUrl} width="100%" height="500px" title="Document Viewer" />
                </div>
            )}
        </div>
    );
}

export default SearchDocument;
