import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const VerifyDocument = () => {
    const [transactionId, setTransactionId] = useState('');
    const [documentHash, setDocumentHash] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [error, setError] = useState('');

    const handleVerify = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/verify_document/${transactionId}/${documentHash}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        setVerificationResult(response.data);
        setError('');
    } catch (error) {
        setVerificationResult(null);
        setError('File not found or invalid credentials');
        console.error('Verification error:', error);
    }
};

    const handleDownload = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/get_document/${documentHash}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `verified_document.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            setError('Error downloading the file');
        }
    };

    return (
        <div className="verify-section">
            <h2>Verify Document</h2>
            <form onSubmit={handleVerify} className="verify-form">
                <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter Transaction ID"
                    className="verify-input"
                />
                <input
                    type="text"
                    value={documentHash}
                    onChange={(e) => setDocumentHash(e.target.value)}
                    placeholder="Enter Document Hash"
                    className="verify-input"
                />
                <button type="submit" className="verify-button">
                    Verify Document
                </button>
            </form>
            
            {error && <p className="verify-error">{error}</p>}
            
            {verificationResult && (
                <div className="verification-result">
                    <p className="success-message">File verified successfully!</p>
                    <button onClick={handleDownload} className="download-button">
                        Download Document
                    </button>
                </div>
            )}
        </div>
    );
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const username = localStorage.getItem("username");

    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/get_notifications/${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            if (error.response?.status === 403) {
                window.location.href = '/login';
            }
        }
    }, [username]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return (
        <div className="notifications-container">
            <VerifyDocument />
            <h2>Document Notifications</h2>
            <div className="notifications-list">
                {notifications.map((notification, index) => (
                    <div key={index} className="notification-card">
                        <h3>Document Added to Blockchain</h3>
                        <p><strong>From:</strong> {notification.sender}</p>
                        <p><strong>Transaction ID:</strong> {notification.transactionId}</p>
                        <p><strong>Document Hash:</strong> {notification.documentHash}</p>
                        <p><strong>Time:</strong> {new Date(notification.timestamp * 1000).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;