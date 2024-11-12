import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ViewRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/get_document_requests', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setRequests(response.data.requests);
            setLoading(false);
        } catch (err) {
            console.error('Error details:', err);
            if (err.response?.status === 403) {
                window.location.href = '/login';
            }
            setError('Error fetching requests');
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (requestId, newStatus, requester, requestType) => {
        try {
            await axios.post('http://localhost:5000/update_request_status', {
                requestId,
                status: newStatus
            });
            
            if (newStatus === 'approved') {
                const username = localStorage.getItem("username");
                const formData = {
                    sender: username,
                    receiver: requester,
                    title: `${requestType.charAt(0).toUpperCase() + requestType.slice(1)} Document`,
                };
                localStorage.setItem('transactionFormData', JSON.stringify(formData));
                
                setTimeout(() => {
                    window.location.href = '/TransactionForm';
                }, 1000);
            }
            
            fetchRequests();
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Error updating request status');
        }
    };

    if (loading) return <div className="loading">Loading requests...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="requests-container">
            <h2>Document Requests</h2>
            <div className="requests-grid">
                {requests.length > 0 ? (
                    requests.map((request) => (
                        <div key={request.timestamp} className="request-item">
                            <div className="request-header">
                                <h3>{request.requestType}</h3>
                                <span className={`status-badge ${request.status}`}>
                                    {request.status}
                                </span>
                            </div>
                            <div className="request-details">
                                <p><strong>From:</strong> {request.requester}</p>
                                <p><strong>Date:</strong> {new Date(request.timestamp * 1000).toLocaleString()}</p>
                                <p><strong>Description:</strong></p>
                                <p className="request-description">{request.description}</p>
                            </div>
                            {request.status === 'pending' && (
                                <div className="request-actions">
                                    <button 
                                        onClick={() => handleStatusUpdate(
                                            request.timestamp, 
                                            'approved', 
                                            request.requester, 
                                            request.requestType
                                        )}
                                        className="approve-btn"
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(request.timestamp, 'rejected')}
                                        className="reject-btn"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="no-requests">No document requests found.</p>
                )}
            </div>
        </div>
    );
};

export default ViewRequests; 