import React from 'react';
import '../styles/ContactUs.css';
import locationPointer from '../assets/locationPointer.gif';

const ContactUs = () => {
  return (
    <div>
      <div className='location-header'>
        <h2 style={{ fontWeight: 800 }}>GET IN TOUCH</h2>
      </div>
      <div className='contact-us-container'>
        <div className='contact-form'>
          <input type='text' placeholder='NAME' className='contact-input' />
          <input type='email' placeholder='EMAIL' className='contact-input' />
          <textarea
            placeholder='CONTENT'
            className='contact-textarea'
          ></textarea>
          <button className='contact-btn'>SEND</button>
        </div>
        <div className='map-container'>
          <iframe
            title='Go Productions Location'
            src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d448843.6236179242!2d77.1305966827735!3d28.491867243392!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3c8554d41db%3A0xccc32753b0a293dd!2sGo%20Productions!5e0!3m2!1sen!2sin!4v1728834522687!5m2!1sen!2sin'
            style={{ width: '100%', height: '100%' }}
            allowFullScreen=''
            loading='lazy'
            referrerpolicy='no-referrer-when-downgrade'
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;