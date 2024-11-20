import React, { useState, useEffect } from 'react';
import axios from 'axios';


const StudentDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [documentHash, setDocumentHash] = useState('');
    const [error, setError] = useState('');
    const username = localStorage.getItem('username');

    useEffect(() => {
        const fetchStudentDocuments = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/get_documents`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                // Filter documents where the current user is the receiver
                const userDocuments = response.data.documents.filter(
                    doc => doc.receiver === username
                );
                setDocuments(userDocuments);
            } catch (error) {
                console.error('Error fetching documents:', error);
                if (error.response?.status === 403) {
                    window.location.href = '/login';
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStudentDocuments();
    }, [username]);

    const handleDownload = async (document_hash) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/get_document/${document_hash}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `document-${document_hash}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading document:', error);
            alert('Error downloading document. Please try again.');
        }
    };

    const handleHashSubmit = async (e) => {
        e.preventDefault();
        if (!documentHash.trim()) {
            setError('Please enter a document hash');
            return;
        }
        await handleDownload(documentHash);
    };

    if (loading) {
        return <div className="loading">Loading your documents...</div>;
    }

    return (
        <div className="student-documents-container">
            <div className="hash-input-section">
                <h2>Download Document by Hash</h2>
                <form onSubmit={handleHashSubmit} className="hash-form">
                    <input
                        type="text"
                        value={documentHash}
                        onChange={(e) => setDocumentHash(e.target.value)}
                        placeholder="Enter document hash..."
                        className="hash-input"
                    />
                    <button type="submit" className="hash-submit-btn">
                        <i className="fas fa-download"></i> Download
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>

            <h2>Your Documents from Blockchain</h2>
            {documents.length > 0 ? (
                <div className="documents-grid">
                    {documents.map((doc, index) => (
                        <div key={index} className="document-card">
                            <div className="document-icon">
                                <i className="fas fa-file-alt"></i>
                            </div>
                            <div className="document-info">
                                <h3>{doc.title}</h3>
                                <div className="document-details">
                                    <p><strong>Sender:</strong> {doc.sender}</p>
                                    <p><strong>Receiver:</strong> {doc.receiver}</p>
                                    <p><strong>Description:</strong> {doc.description}</p>
                                    <p className="document-hash">
                                        <strong>Document Hash:</strong>
                                        <span>{doc.document_hash}</span>
                                    </p>
                                    <p className="document-date">
                                        
    Added on: <i class="fa-solid fa-calendar-days"></i> {new Date(doc.timestamp * 1000).toLocaleString ('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium'
        
    })}
    
</p>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-documents">
                    <i className="fas fa-folder-open"></i>
                    <p>No documents have been uploaded for your requests yet.</p>
                </div>
                
            )}
        </div>
    );
};

export default StudentDocuments;