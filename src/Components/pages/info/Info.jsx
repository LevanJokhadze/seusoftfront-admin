import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import "./info.css"

const Info = () => {
  const [siteInfos, setSiteInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState({ id: null, field: '', value: '' });
  const [updateError, setUpdateError] = useState(null);
  const [newSiteInfo, setNewSiteInfo] = useState({
    name: '',
    titleEn: '',
    titleGe: '',
    addressEn: '',
    addressGe: '',
    email: '',
    number: '',
    fb: '',
    ig: '',
    twitter: '',
    in: '',
    copyright: ''
  });

  useEffect(() => {
    fetchSiteInfos();
  }, []);

  const fetchSiteInfos = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get(`${process.env.REACT_APP_API_KEY}contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setSiteInfos(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const handleEditClick = (siteInfo, field) => {
    setEditing({ id: siteInfo.id, field, value: siteInfo[field] });
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
      setSiteInfos((prevSiteInfos) =>
        prevSiteInfos.map((siteInfo) =>
          siteInfo.id === editing.id
            ? { ...siteInfo, [editing.field]: editing.value }
            : siteInfo
        )
      );
      setEditing({ id: null, field: '', value: '' });
      setUpdateError(null);
    } catch (err) {
      console.error("Error updating site info:", err);
      setUpdateError("Failed to update site info.");
    }
  };

  const handleNewSiteInfoChange = (e) => {
    setNewSiteInfo({ ...newSiteInfo, [e.target.name]: e.target.value });
  };

  const handleAddSiteInfo = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('token');
      const response = await axios.post(`${process.env.REACT_APP_API_KEY_ADMIN}add-contact`, newSiteInfo, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setSiteInfos([...siteInfos, response.data.data]);
      setNewSiteInfo({
        name: '',
        titleEn: '',
        titleGe: '',
        addressEn: '',
        addressGe: '',
        email: '',
        number: '',
        fb: '',
        ig: '',
        twitter: '',
        in: '',
        copyright: ''
      });
    } catch (err) {
      console.error("Error adding site info:", err);
      setUpdateError("Failed to add site info.");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error fetching site info: {error.message}</div>;

  return (
    <div className="contacts-container">
      <h1 className="contacts-title">Site Information</h1>
      
      {siteInfos.length === 0 && (
        <div className="add-contact-section">
          <h2 className="section-title">Add New Site Information</h2>
          <form onSubmit={handleAddSiteInfo} className="add-contact-form">
            <input type="text" name="name" value={newSiteInfo.name} onChange={handleNewSiteInfoChange} placeholder="Website Name" required className="form-input" />
            <input type="text" name="titleEn" value={newSiteInfo.titleEn} onChange={handleNewSiteInfoChange} placeholder="SubTitle (English)" required className="form-input" />
            <input type="text" name="titleGe" value={newSiteInfo.titleGe} onChange={handleNewSiteInfoChange} placeholder="SubTitle (Georgian)" required className="form-input" />
            <input type="text" name="addressEn" value={newSiteInfo.addressEn} onChange={handleNewSiteInfoChange} placeholder="Address (English)" required className="form-input" />
            <input type="text" name="addressGe" value={newSiteInfo.addressGe} onChange={handleNewSiteInfoChange} placeholder="Address (Georgian)" required className="form-input" />
            <input type="email" name="email" value={newSiteInfo.email} onChange={handleNewSiteInfoChange} placeholder="Email" required className="form-input" />
            <input type="text" name="number" value={newSiteInfo.number} onChange={handleNewSiteInfoChange} placeholder="Number" required className="form-input" />
            <input type="text" name="fb" value={newSiteInfo.fb} onChange={handleNewSiteInfoChange} placeholder="Facebook" className="form-input" />
            <input type="text" name="ig" value={newSiteInfo.ig} onChange={handleNewSiteInfoChange} placeholder="Instagram" className="form-input" />
            <input type="text" name="twitter" value={newSiteInfo.twitter} onChange={handleNewSiteInfoChange} placeholder="Twitter" className="form-input" />
            <input type="text" name="in" value={newSiteInfo.in} onChange={handleNewSiteInfoChange} placeholder="LinkedIn" className="form-input" />
            <input type="text" name="copyright" value={newSiteInfo.copyright} onChange={handleNewSiteInfoChange} placeholder="Copyright" className="form-input" />
            <button type="submit" className="submit-button">Add Site Info</button>
          </form>
        </div>
      )}

      <ul className="contacts-list">
        {siteInfos.map((siteInfo) => (
          <li key={siteInfo.id} className="contact-item">
            <div className="contact-field">
              <strong>Website Name: <span>{siteInfo.name}</span></strong> 
              <button className="edit-button" onClick={() => handleEditClick(siteInfo, 'name')}>Edit</button>
            </div>
            <div className="contact-field">
              <strong>SubTitle (Eng): <span>{siteInfo.titleEn}</span></strong> 
              <button className="edit-button" onClick={() => handleEditClick(siteInfo, 'titleEn')}>Edit</button>
            </div>
            <div className="contact-field">
              <strong>SubTitle (Geo): <span>{siteInfo.titleGe}</span></strong> 
              <button className="edit-button" onClick={() => handleEditClick(siteInfo, 'titleGe')}>Edit</button>
            </div>
            <div className="contact-field">
              <strong>Address (Eng): <span>{siteInfo.addressEn}</span></strong> 
              <button className="edit-button" onClick={() => handleEditClick(siteInfo, 'addressEn')}>Edit</button>
            </div>
            <div className="contact-field">
              <strong>Address (Geo): <span>{siteInfo.addressGe}</span></strong> 
              <button className="edit-button" onClick={() => handleEditClick(siteInfo, 'addressGe')}>Edit</button>
            </div>
            <div className="contact-field">
              <strong>Email: <span>{siteInfo.email}</span></strong> 
              <button className="edit-button" onClick={() => handleEditClick(siteInfo, 'email')}>Edit</button>
            </div>
            <div className="contact-field">
              <strong>Number: <span>{siteInfo.number}</span></strong> 
              <button className="edit-button" onClick={() => handleEditClick(siteInfo, 'number')}>Edit</button>
            </div>
            <div className="contact-field">
              <strong>Facebook: <span>{siteInfo.fb}</span></strong> 
              <button className="edit-button" onClick={() => handleEditClick(siteInfo, 'fb')}>Edit</button>
            </div>
            <div className="contact-field">
              <strong>Instagram: <span>{siteInfo.ig}</span></strong> 
              <button className="edit-button" onClick={() => handleEditClick(siteInfo, 'ig')}>Edit</button>
            </div>
            <div className="contact-field">
              <strong>Twitter: <span>{siteInfo.twitter}</span></strong> 
              <button className="edit-button" onClick={() => handleEditClick(siteInfo, 'twitter')}>Edit</button>
            </div>
            <div className="contact-field">
              <strong>LinkedIn: <span>{siteInfo.in}</span></strong> 
              <button className="edit-button" onClick={() => handleEditClick(siteInfo, 'in')}>Edit</button>
            </div>
            <div className="contact-field">
              <strong>Copyright: <span>{siteInfo.copyright}</span></strong> 
              <button className="edit-button" onClick={() => handleEditClick(siteInfo, 'copyright')}>Edit</button>
            </div>

            {editing.id === siteInfo.id && (
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

export default Info;