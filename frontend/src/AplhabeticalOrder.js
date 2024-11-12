import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AlphabeticalOrder = () => {
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        // Fetch documents in alphabetical order when component loads
        axios.get('http://localhost:5000/get_documents_by_alphabetical_order')
            .then(response => setDocuments(response.data.documents))
            .catch(error => console.error('Error fetching documents:', error));
    }, []);
    const viewDocument = (document_hash) => {
        const url = `http://localhost:5000/get_document/${document_hash}`;
        window.open(url, '_blank');
    };

    return (
        <div div className="alphabetical-documents-container">
            <h1 className="alphabetical-title">Documents in Alphabetical Order</h1>
            <ul className="alphabetical-documents-list">
                {documents.map((doc, index) => (
                    <li key={index} className="alphabetical-document-item">
                        <strong className="alphabetical-document-title">Title:</strong><span className="document-title"> {doc.title} </span> <br />
                        <button onClick={() => viewDocument(doc.document_hash)} className="alphabetical-document-button">
                            <i className="fa-solid fa-folder"></i> {doc.title}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AlphabeticalOrder;
