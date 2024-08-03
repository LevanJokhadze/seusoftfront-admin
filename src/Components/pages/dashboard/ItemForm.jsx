import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Dashboard.css';

const API_ADMIN_URL = process.env.REACT_APP_API_KEY_ADMIN;

const getToken = () => {
  return Cookies.get('token');
};

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const ItemForm = ({ item, onSubmit, onCancel, isEditMode }) => {
  const [type, setType] = useState(1);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleGe: '',
    bodyEn: '',
    bodyGe: '',
    titlesEn: [''],
    titlesGe: [''],
    images: [null]
  });
  const [shouldRenderEditor, setShouldRenderEditor] = useState(type === 1);

useEffect(() => {
  if (type === 1) {
    setShouldRenderEditor(true);
  } else {
    setTimeout(() => setShouldRenderEditor(false), 0);
  }
}, [type]);

  useEffect(() => {
    if (item) {
      setFormData({
        titleEn: item.titleEn || '',
        titleGe: item.titleGe || '',
        bodyEn: item.bodyEn || '',
        bodyGe: item.bodyGe || '',
        titlesEn: item.titlesEn || [''],
        titlesGe: item.titlesGe || [''],
        images: item.images || [null]
      });

      if (item.bodyEn || item.bodyGe) {
        setType(1);
      } else {
        setType(2);
      }
    }
  }, [item]);

  const handleTypeChange = (e) => setType(Number(e.target.value));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTitleChange = (index, value, lang) => {
    setFormData(prev => {
      const newTitles = lang === 'en' ? [...prev.titlesEn] : [...prev.titlesGe];
      newTitles[index] = value;
      return lang === 'en' ? { ...prev, titlesEn: newTitles } : { ...prev, titlesGe: newTitles };
    });
  };

  const handleFileChange = async (index, file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axiosInstance.post(`${API_ADMIN_URL}upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData(prev => {
        const newImages = [...prev.images];
        newImages[index] = response.data.url;
        return { ...prev, images: newImages };
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleEditorChange = (content, lang) => {
    setFormData(prev => lang === 'en' ? ({ ...prev, bodyEn: content }) : ({ ...prev, bodyGe: content }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      titlesEn: [...prev.titlesEn, ''],
      titlesGe: [...prev.titlesGe, ''],
      images: [...prev.images, null]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      titlesEn: prev.titlesEn.filter((_, i) => i !== index),
      titlesGe: prev.titlesGe.filter((_, i) => i !== index),
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (type === 2) {
      if (formData.titlesEn.some(title => !title.trim()) ||
          formData.titlesGe.some(title => !title.trim()) ||
          formData.images.some(image => !image)) {
        alert("Please fill all fields");
        return false;
      }
    } else {
      if (!formData.titleEn.trim() || !formData.titleGe.trim() ||
          !formData.bodyEn.trim() || !formData.bodyGe.trim()) {
        alert("Please fill all fields");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!validateForm()) {
      return;
    }

    let dataToSubmit;

    if (type === 2) {
      dataToSubmit = {
        type: 2,
        titleEn: formData.titleEn,
        titleGe: formData.titleGe,
        titlesEn: JSON.stringify(formData.titlesEn),
        titlesGe: JSON.stringify(formData.titlesGe),
        images: JSON.stringify(formData.images)
      };
    } else {
      dataToSubmit = {
        type: 1,
        titleEn: formData.titleEn,
        titleGe: formData.titleGe,
        bodyEn: formData.bodyEn,
        bodyGe: formData.bodyGe,
        titlesEn: JSON.stringify(null),
        titlesGe: JSON.stringify(null),
        images: JSON.stringify(null)
      };
    }

    try {
      let response;
      if (isEditMode) {
        response = await axiosInstance.put(
          `${API_ADMIN_URL}edit-product/${item.id}`,
          dataToSubmit
        );
      } else {
        response = await axiosInstance.post(
          `${API_ADMIN_URL}store-product`,
          dataToSubmit
        );
      }
 
      onSubmit(response.data.data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="item-form">
      <label>
        Title (English):
        <input
          type="text"
          name="titleEn"
          value={formData.titleEn}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Title (Georgian):
        <input
          type="text"
          name="titleGe"
          value={formData.titleGe}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Type:
        <select name="type" value={type} onChange={handleTypeChange}>
          <option value={1}>Single</option>
          <option value={2}>Multiple</option>
        </select>
      </label>

      {type === 2 ? (
        <>
          {formData.images.map((_, index) => (
            <div key={index} className="multi-item">
              <label>
                Title (English):
                <input
                  type="text"
                  value={formData.titlesEn[index]}
                  onChange={(e) => handleTitleChange(index, e.target.value, 'en')}
                />
              </label>
              <label>
                Title (Georgian):
                <input
                  type="text"
                  value={formData.titlesGe[index]}
                  onChange={(e) => handleTitleChange(index, e.target.value, 'ge')}
                />
              </label>
              <label>
                Image:
                <input
                  type="file"
                  onChange={(e) => handleFileChange(index, e.target.files[0])}
                />
                 <span>{formData.images[index]}</span>
              </label>
              <button type="button" onClick={() => removeItem(index)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addItem}>Add Item</button>
        </>
      ) : (
        <>
        {shouldRenderEditor && (
          <>
          <label>
            Body (English):
            <Editor
              apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
              value={formData.bodyEn}
              onEditorChange={(content) => handleEditorChange(content, 'en')}
              init={{
                plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker a11ychecker tinymcespellchecker permanentpen powerpaste advtable advcode editimage advtemplate ai mentions tinycomments tableofcontents footnotes mergetags autocorrect typography inlinecss markdown',
                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                tinycomments_mode: 'embedded',
                tinycomments_author: 'Author name',
                mergetags_list: [
                  { value: 'First.Name', title: 'First Name' },
                  { value: 'Email', title: 'Email' },
                ],
                ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
              }}
              onInit={(evt, editor) => {
                console.log('Editor is ready to use!', editor);
              }}
            />
          </label>
          <label>
            Body (Georgian):
            <Editor
              apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
              value={formData.bodyGe}
              onEditorChange={(content) => handleEditorChange(content, 'ge')}
              init={{
                plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker a11ychecker tinymcespellchecker permanentpen powerpaste advtable advcode editimage advtemplate ai mentions tinycomments tableofcontents footnotes mergetags autocorrect typography inlinecss markdown',
                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                tinycomments_mode: 'embedded',
                tinycomments_author: 'Author name',
                mergetags_list: [
                  { value: 'First.Name', title: 'First Name' },
                  { value: 'Email', title: 'Email' },
                ],
                ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
              }}
              onInit={(evt, editor) => {
                console.log('Editor is ready to use!', editor);
              }}
            />
          </label></>
        )}
        </>
      )}

      <button type="submit">{isEditMode ? 'Update' : 'Add'} Item</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default ItemForm;
