import React from 'react';

const CampusMap = () => {
  return (
    <div className="campus-map-container fade-in">
      <div className="map-header">
        <h3 className="section-title">BBD University Campus Map</h3>
        <p className="text-secondary">Navigate through Blocks A to Y, Stadium, and Hostels</p>
      </div>
      <div className="map-wrapper">
        <iframe 
          title="BBDU Campus Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3382.5411520879875!2d81.058662!3d26.883855000000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399be20c01166fb1:0xac6e48a13084db40!2sDr.%20Akhilesh%20Das%20Gupta%20Stadium!5e1!3m2!1sen!2sin!4v1776022716162!5m2!1sen!2sin"
          width="100%" 
          height="400" 
          style={{ border: 0, borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
};

export default CampusMap;
