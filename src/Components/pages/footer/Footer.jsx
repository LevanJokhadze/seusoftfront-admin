import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const Footer = () => {
    const [footer, setFooter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', lists: [], href: '' });
    const [newForm, setNewForm] = useState({ title: '', lists: '', href: '' });

    useEffect(() => {
        fetchFooterLinks();
    }, []);

    const fetchFooterLinks = async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`${process.env.REACT_APP_API_KEY}show-footer-links`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });      
            setFooter(response.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.message || 'An error occurred while fetching data');
            setLoading(false);
        }
    };

    const handleStore = async (e) => {
        e.preventDefault();
        try {
            const token = Cookies.get('token');
            await axios.post(`${process.env.REACT_APP_API_KEY_ADMIN}store-links`, 
                {
                    ...newForm,
                    lists: newForm.lists.split(',').map(item => item.trim())
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setNewForm({ title: '', lists: '', href: '' });
            fetchFooterLinks();
        } catch (err) {
            setError(err.message || 'An error occurred while adding new item');
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setEditForm({ title: item.title, lists: item.lists, href: item.href });
    };

    const handleUpdate = async () => {
        try {
            const token = Cookies.get('token');
            await axios.put(`${process.env.REACT_APP_API_KEY_ADMIN}edit-links/${editingId}`, editForm, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setEditingId(null);
            fetchFooterLinks();
        } catch (err) {
            setError(err.message || 'An error occurred while updating');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const token = Cookies.get('token');
                await axios.delete(`${process.env.REACT_APP_API_KEY}delete-links/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                fetchFooterLinks();
            } catch (err) {
                setError(err.message || 'An error occurred while deleting');
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Footer Edit</h1>
            <div className="store">
                <form onSubmit={handleStore}>
                    <input 
                        value={newForm.title}
                        onChange={(e) => setNewForm({...newForm, title: e.target.value})}
                        placeholder="Title"
                        required
                    />
                    <input 
                        value={newForm.lists}
                        onChange={(e) => setNewForm({...newForm, lists: e.target.value})}
                        placeholder="Lists (comma-separated)"
                        required
                    />
                    <input 
                        value={newForm.href}
                        onChange={(e) => setNewForm({...newForm, href: e.target.value})}
                        placeholder="Href"
                        required
                    />
                    <button type="submit">Add New Footer Link</button>
                </form>
            </div>
            {footer.map((item) => (
                <div key={item.id}>
                    {editingId === item.id ? (
                        <div>
                            <input 
                                value={editForm.title}
                                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            />
                            <input 
                                value={editForm.lists.join(', ')}
                                onChange={(e) => setEditForm({...editForm, lists: e.target.value.split(', ')})}
                            />
                            <input 
                                value={editForm.href}
                                onChange={(e) => setEditForm({...editForm, href: e.target.value})}
                            />
                            <button onClick={handleUpdate}>Save</button>
                            <button onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                    ) : (
                        <div>
                            <h2>{item.title} <button onClick={() => handleEdit(item)}>Edit</button></h2>
                            <ul>
                                {item.lists.map((listItem, listIndex) => (
                                    <li key={listIndex}>{listItem}</li>
                                ))}
                            </ul>
                            <p>Href: {item.href}</p>
                            <button onClick={() => handleDelete(item.id)}>Delete</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Footer;