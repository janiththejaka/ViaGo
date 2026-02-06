import React from 'react';
import { Button, Image } from 'react-bootstrap';
import { FaArrowLeft, FaUserCircle } from 'react-icons/fa';

interface TopNavbarProps {
    userName?: string; // Backend එකෙන් එන නම
    userImage?: string; // User ගේ Photo එක (Optional)
    onBackClick?: () => void; // Back Button Click කළාම Home එකට යනවා
}

export default function TopNavbar({ userName = "Guest", userImage, onBackClick }: TopNavbarProps) {
    return (
        <div
            className="d-flex justify-content-between align-items-center px-3 py-2 fixed-top"
            style={{
                background: 'rgba(255, 255, 255, 0.9)', // වීදුරු වගේ පෙනුම (Glassmorphism)
                backdropFilter: 'blur(10px)',            // පසුබිම බොඳ කිරීම
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 1040, // Map එකට උඩින්, හැබැයි Modal එකට යටින්
                height: '60px'
            }}
        >
            {/* LEFT: Menu & Brand */}
            <div className="d-flex align-items-center gap-3">
                <Button variant="light" className="rounded-circle shadow-sm p-2 border-0" onClick={onBackClick}>
                    <FaArrowLeft size={20} className="text-dark" />
                </Button>
                <h4 className="m-0 fw-bold text-dark" style={{ letterSpacing: '-1px' }}>
                    Via<span className="text-success">GO</span>
                </h4>
            </div>

            {/* RIGHT: User Profile */}
            <div className="d-flex align-items-center gap-2 bg-white px-3 py-1 rounded-pill shadow-sm border">
                <span className="fw-semibold text-secondary d-none d-sm-block">Hi, {userName}</span>

                {userImage ? (
                    <Image
                        src={userImage}
                        roundedCircle
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                    />
                ) : (
                    <FaUserCircle size={32} className="text-secondary" />
                )}
            </div>
        </div>
    );
}