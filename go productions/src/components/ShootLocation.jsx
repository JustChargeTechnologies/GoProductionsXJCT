import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import '../styles/ShootLocation.css';
import { shootLocationData } from '../data/data';
import SwiperComponent from './Sliders/SwiperComponent';

const ShootLocation = () => {
  return (
    <div className='shoot-location-container'>
      <div className='location-header'>
        <h2 style={{ fontWeight: 800, fontSize: '48px' }}>LOCATION</h2>
      </div>
      <SwiperComponent />
    </div>
  );
};

export default ShootLocation;
