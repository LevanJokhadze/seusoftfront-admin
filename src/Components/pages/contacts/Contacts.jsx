import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_KEY}list-contacts`);
        console.log(response.data); // Log the response data
        setContacts(response.data.data); // Access the data property
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error fetching contacts: {error.message}</div>;

  return (
    <div>
      <h1>Contacts</h1>
      <ul>
        {contacts.map(contact => (
          <li key={contact.id} style={{ marginBottom: '20px' }}>
            <p><strong>Name:</strong> {contact.name}</p>
            <p><strong>Last Name:</strong> {contact.last_name}</p>
            <p><strong>Email:</strong> {contact.email}</p>
            <p><strong>Number:</strong> {contact.number}</p>
            <p><strong>Company:</strong> {contact.company}</p>
            <p><strong>Service:</strong> {contact.service}</p>
            <p><strong>Message:</strong> {contact.message}</p>
            <p><strong>Created At:</strong> {new Date(contact.created_at).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(contact.updated_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Contacts;
