import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../index.css"

function Home() {
  const navigate = useNavigate();

  const handleLoginClick = (userType) => {
    navigate(`/login/${userType}`); 
  };

  return (
    <div>
      <h1 className='heading'>Welcome, Login As?</h1>
      <div className='home-btn-container'>
        <button className="home-btn" onClick={() => handleLoginClick('principal')}>Principal</button>
        <button className="home-btn" onClick={() => handleLoginClick('teacher')}>Teacher</button>
        <button className="home-btn" onClick={() => handleLoginClick('student')}>Student</button>
      </div>

    </div>
  );
}

export default Home;
