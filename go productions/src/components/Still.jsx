import React from 'react';
import { stillImages } from '../data/data';
import '../styles/Still.css';

const Still = () => {
  const imagePairs = [];
  for (let i = 0; i < stillImages.length; i += 2) {
    imagePairs.push(stillImages.slice(i, i + 2));
  }

  return (
    <section className='still-section'>
      <div className='still-header'>
        <h2>STILL</h2>
        <p>Your Vision, Our Expertise</p>
        <a href='/stills' className='see-more'>
          See More
        </a>
      </div>

      {imagePairs.map((pair, rowIndex) => (
        <div key={rowIndex} className='still-images'>
          {pair.map((image, index) => {
            // Determine if the image should be styled as large or small
            const isLarge =
              (rowIndex % 2 === 0 && index === 0) ||
              (rowIndex % 2 !== 0 && index !== 0);

            return (
              <div
                key={index}
                className={`image-container ${isLarge ? 'large' : 'small'}`}
              >
                <img
                  src={image.imgUrl}
                  alt={image.altText}
                  className='main-image'
                />
                <div className='overlay'>
                  <img
                    src={image.logoUrl}
                    alt={`${image.altText} Logo`}
                    className={`logo ${isLarge ? 'top-center' : 'left-center'}`}
                  />
                  <p
                    className={`hover-text ${
                      isLarge ? 'bottom-center' : 'right-center'
                    }`}
                  >
                    {image.hoverText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
};

export default Still;