import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TransactionForm() {
  const [formData, setFormData] = useState({
    sender: '',
    receiver: '',
    title: '',
    description: ''
  });
  const [file, setFile] = useState(null); // State to hold the file

  useEffect(() => {
    // Get stored form data
    const storedData = localStorage.getItem('transactionFormData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setFormData(prev => ({
        ...prev,
        sender: parsedData.sender || '',
        receiver: parsedData.receiver || '',
        title: parsedData.title || ''
      }));
      // Clear the stored data
      localStorage.removeItem('transactionFormData');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store the selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('sender', formData.sender);
    data.append('receiver', formData.receiver);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('file', file);

    try {
        const response = await axios.post('http://localhost:5000/add_transaction', data);
        
        // Create notification for the student with the response data
        const notificationData = {
            sender: formData.sender,
            receiver: formData.receiver,
            documentHash: response.data.file_hash, // Changed from document_hash
            transactionId: response.data.block_index, // Use block index as transaction ID
            timestamp: Date.now() / 1000
        };

        await axios.post('http://localhost:5000/create_notification', notificationData);
        alert('Document added to blockchain successfully!');
        setTimeout(() => {
            window.location.href = '/ViewRequests';
        }, 1000);
    } catch (error) {
        console.error("Error submitting transaction:", error);
        if (error.response?.data?.message) {
            alert(error.response.data.message);
        } else {
            alert("There was an error submitting the transaction!");
        }
    }
  };

  return (
    <div className="submit-container">
      <h1 className="form-title">Upload File</h1>
      <form onSubmit={handleSubmit} className="submit-form">
        <input
          type="text"
          name="sender"
          placeholder="Sender"
          value={formData.sender}
          onChange={handleChange}
          className="input-field"
          required
        />
        <input
          type="text"
          name="receiver"
          placeholder="Receiver"
          value={formData.receiver}
          onChange={handleChange}
          className="input-field"
          required
        />
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="input-field"
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="input-field"
          required
        />
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
          required/>
    Choose a file
  </label>
</div>
        <button type="submit" className="submit-button">Submit Transaction</button>
      </form>
    </div>
  );
}

export default TransactionForm;
