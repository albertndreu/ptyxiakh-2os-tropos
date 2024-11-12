import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

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
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return (
        <div className="notifications-container">
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