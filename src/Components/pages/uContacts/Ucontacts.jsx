import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import "./Ucontacts.css"

const Ucontacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState({ id: null, field: '', value: '' });
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get(`${process.env.REACT_APP_API_KEY}contacts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setContacts(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleEditClick = (contact, field) => {
    setEditing({ id: contact.id, field, value: contact[field] });
  };

  const handleInputChange = (e) => {
    setEditing((prev) => ({ ...prev, value: e.target.value }));
  };

  const handleSaveClick = async () => {
    try {
      const token = Cookies.get('token');
      await axios.put(`${process.env.REACT_APP_API_KEY_ADMIN}edit-contact/${editing.id}`, {
        [editing.field]: editing.value,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === editing.id
            ? { ...contact, [editing.field]: editing.value }
            : contact
        )
      );
      setEditing({ id: null, field: '', value: '' });
      setUpdateError(null);
    } catch (err) {
      console.error("Error updating contact:", err);
      setUpdateError("Failed to update contact.");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error fetching contacts: {error.message}</div>;

  return (
    <div className="contacts-container">
      <h1 className="contacts-title">Contacts</h1>
      <ul className="contacts-list">
        {contacts.map((contact) => (
          <li key={contact.id} className="contact-item">
            <p>
              <strong>SubTitle: </strong> {contact.title}
              <button className="edit-button" onClick={() => handleEditClick(contact, 'title')}>Edit</button>
            </p>
            <p>
              <strong>Address: </strong> {contact.address}
              <button className="edit-button" onClick={() => handleEditClick(contact, 'address')}>Edit</button>
            </p>
            <p>
              <strong>Email: </strong> {contact.email}
              <button className="edit-button" onClick={() => handleEditClick(contact, 'email')}>Edit</button>
            </p>
            <p>
              <strong>Number: </strong> {contact.number}
              <button className="edit-button" onClick={() => handleEditClick(contact, 'number')}>Edit</button>
            </p>
            <p>
              <strong>Facebook: </strong> {contact.fb}
              <button className="edit-button" onClick={() => handleEditClick(contact, 'fb')}>Edit</button>
            </p>
            <p>
              <strong>Instagram: </strong> {contact.ig}
              <button className="edit-button" onClick={() => handleEditClick(contact, 'ig')}>Edit</button>
            </p>
            <p>
              <strong>Twitter: </strong> {contact.twitter}
              <button className="edit-button" onClick={() => handleEditClick(contact, 'twitter')}>Edit</button>
            </p>
            <p>
              <strong>Linkdin: </strong> {contact.in}
              <button className="edit-button" onClick={() => handleEditClick(contact, 'in')}>Edit</button>
            </p>
            <p>
              <strong>Copyright: </strong> {contact.copyright}
              <button className="edit-button" onClick={() => handleEditClick(contact, 'copyright')}>Edit</button>
            </p>

            {editing.id === contact.id && (
              <div className="edit-form">
                <input
                  type="text"
                  value={editing.value}
                  onChange={handleInputChange}
                  className="edit-input"
                />
                <button onClick={handleSaveClick} className="save-button">Save</button>
                {updateError && <p className="update-error">{updateError}</p>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Ucontacts;