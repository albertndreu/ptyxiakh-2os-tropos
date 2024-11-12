import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrderByDate = () => {
  const [documents, setDocuments] = useState([]);
  
  useEffect(() => {
    // Fetch documents from the blockchain server
    axios.get('http://localhost:5000/get_documents_by_date')
      .then(response => {
        setDocuments(response.data.documents);
      })
      .catch(error => {
        console.error("There was an error fetching the documents!", error);
      });
  }, []);

  const viewDocument = (document_hash) => {
        const url = `http://localhost:5000/get_document/${document_hash}`;
        window.open(url, '_blank');
    };

  return (
    <div className="orderbydate-container">
      <h2>Documents Ordered by Date</h2>
      {documents.length > 0 ? (
        <ul className="orderbydate-list">
          {documents.map((doc, index) => (
            <li key={index}>
              <strong>Title:</strong> {doc.title}<br />
              <strong>Description:</strong> {doc.description} <i class="fa-solid fa-file"></i><br />
              <strong><i class="fa-solid fa-calendar-days"></i> Date:</strong> {new Date(doc.timestamp * 1000).toLocaleString()} <i class="fa-solid fa-clock"></i><br />
              <button onClick={() => viewDocument(doc.document_hash)} className="orderbydate-button">
                <i className="fa-solid fa-folder"></i> {doc.title}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="orderbydate-no-documents">No documents found.</p>
      )}
    </div>
  );
};

export default OrderByDate;
