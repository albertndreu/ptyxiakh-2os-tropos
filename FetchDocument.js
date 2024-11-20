import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FetchDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fileToUpdate, setFileToUpdate] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            const organization = localStorage.getItem('username');
            console.log('Fetching documents for organization:', organization);

            const response = await axios.get('http://localhost:5000/get_organization_documents', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    organization: organization,
                },
            });

            setDocuments(response.data.documents);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            if (error.response?.status === 403) {
                window.location.href = '/login';
            } else {
                setError('Error fetching documents');
            }
            setLoading(false);
        }
    };

    const viewDocument = async (document_hash) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No authentication token found. Please log in again.");
            window.location.href = '/login';
            return;
        }

        const url = `http://localhost:5000/get_document/${document_hash}`;
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            responseType: 'blob', // Ensure the response is treated as a blob
        });

        // Create a URL for the PDF and open it in a new tab
        const fileURL = window.URL.createObjectURL(new Blob([response.data]));
        window.open(fileURL, '_blank'); // Open the file in a new tab
    } catch (error) {
        if (error.response?.status === 403) {
            alert("Authentication error. Please log in again.");
            window.location.href = '/login';
        } else {
            console.error('Error viewing document:', error);
        }
    }
};

    const handleFileChange = (event) => {
        setFileToUpdate(event.target.files[0]);
    };

    const handleUpdate = async (document) => {
        if (!fileToUpdate) return;

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', fileToUpdate);
        formData.append('sender', localStorage.getItem('username'));
        formData.append('receiver', document.receiver); // Adjust as necessary
        formData.append('title', document.title);
        formData.append('description', 'Updated file');
        formData.append('original_hash', document.document_hash);

        try {
            const response = await axios.post('http://localhost:5000/update_transaction', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            alert(response.data.message);

            const mineResponse = await axios.get('http://localhost:5000/mine', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            alert(mineResponse.data.message);

            setFileToUpdate(null);
            setSelectedDocument(null);
            await fetchDocuments();
        } catch (error) {
            if (error.response?.status === 403) {
                alert("Authentication error. Please log in again.");
                window.location.href = '/login';
            } else {
                alert("There was an error submitting the transaction!");
            }
        }
    };

    if (loading) return <div>Loading documents...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="Alldocuments-container">
            <h1 className="Alldocuments-title">All Documents</h1>
            <table className="Alldocuments-table">
                <thead>
                    <tr>
                        <th>Document Title</th>
                        <th>Receiver</th>
                        <th>Block Number</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map((doc) => (
                        <tr key={doc.document_hash}>
                            <td>{doc.title}</td>
                            <td>{doc.receiver}</td>
                            <td>Block #{doc.block_number}</td>
                            <td>
                                <button onClick={() => viewDocument(doc.document_hash)} className="Alldocument-link">
                                    <i className="fa-solid fa-folder"></i> View
                                </button>
                                <button onClick={() => setSelectedDocument(doc)} className="Alledit-button">Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedDocument && (
                <div className="Allupdate-container">
                    <h2>Update Document: {selectedDocument.title}</h2>
                    <div className="container-folder">
                        <div className="folder">
                            <div className="front-side">
                                <div className="tip"></div>
                                <div className="cover"></div>
                            </div>
                            <div className="back-side cover"></div>
                        </div>
                        <label className="custom-file-upload">
                            <input className="title" type="file"
                                onChange={handleFileChange}
                                required />
                            Choose a file
                        </label>
                    </div>
                    <button onClick={() => handleUpdate(selectedDocument)}>Submit Update</button>
                </div>
            )}
        </div>
    );
};

export default FetchDocuments;