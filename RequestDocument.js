import React, { useState } from 'react';
import axios from 'axios';

const RequestDocument = () => {
    const username = localStorage.getItem("username");
    const [descriptions, setDescriptions] = useState({
        transcript: '',
        certificate: '',
        recommendation: '',
        other: ''
    });
    const [message, setMessage] = useState('');

    const handleDescriptionChange = (type, value) => {
        setDescriptions(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const handleRequest = async (type) => {
        try {
            const token = localStorage.getItem('token');
            let targetOrganization;
            if (type === 'transcript' || type === 'certificate') {
                targetOrganization = 'Grammateia';
            } else if (type === 'recommendation' || type === 'other') {
                targetOrganization = 'Prutaneia';
            }

            const response = await axios.post('http://localhost:5000/request_document', {
                requester: username,
                requestType: type,
                description: descriptions[type] || '.',
                targetOrganization: targetOrganization
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            });

            if (response.status === 201) {
                setMessage('Request sent successfully!');
                setDescriptions(prev => ({
                    ...prev,
                    [type]: ''
                }));
                
                setTimeout(() => {
                    window.location.href = '/ViewRequests';
                }, 1000);
            }
        } catch (error) {
            console.error('Error details:', error);
            setMessage('Error sending request. Please try again.');
        }
    };

    return (
        <div className="request-container">
            <h2>Request Documents</h2>
            <div className="request-buttons">
                <div className="request-card">
                    <h3>Academic Transcript</h3>
                    <p>Request your official academic records</p>
                    <textarea
                        placeholder="Add any specific details about your request..."
                        value={descriptions.transcript}
                        onChange={(e) => handleDescriptionChange('transcript', e.target.value)}
                    />
                    <button onClick={() => handleRequest('transcript')}>
                        Request Transcript
                    </button>
                </div>

                <div className="request-card">
                    <h3>Certificate</h3>
                    <p>Request your certification documents</p>
                    <textarea
                        placeholder="Add any specific details about your request..."
                        value={descriptions.certificate}
                        onChange={(e) => handleDescriptionChange('certificate', e.target.value)}
                    />
                    <button onClick={() => handleRequest('certificate')}>
                        Request Certificate
                    </button>
                </div>

                <div className="request-card">
                    <h3>Recommendation Letter</h3>
                    <p>Request a letter of recommendation</p>
                    <textarea
                        placeholder="Add any specific details about your request..."
                        value={descriptions.recommendation}
                        onChange={(e) => handleDescriptionChange('recommendation', e.target.value)}
                    />
                    <button onClick={() => handleRequest('recommendation')}>
                        Request Letter
                    </button>
                </div>

                <div className="request-card">
                    <h3>Other Documents</h3>
                    <p>Request any other official documents</p>
                    <textarea
                        placeholder="Add any specific details about your request..."
                        value={descriptions.other}
                        onChange={(e) => handleDescriptionChange('other', e.target.value)}
                    />
                    <button onClick={() => handleRequest('other')}>
                        Request Other
                    </button>
                </div>
            </div>
            {message && <div className="request-message">{message}</div>}
        </div>
    );
};

export default RequestDocument;