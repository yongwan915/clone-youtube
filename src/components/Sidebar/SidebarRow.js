import React from 'react';
import { Link } from 'react-router-dom';
import './SidebarRow.css';

function SidebarRow({ selected, Icon, title, href, isOpen }) {
  return (
    <Link to={href} className="sidebarRow__link">
      <div className={`sidebarRow ${selected && "selected"} ${!isOpen && "sidebarRow--closed"}`}>
        <Icon className="sidebarRow__icon" />
        {isOpen && <h2 className="sidebarRow__title">{title}</h2>}
      </div>
    </Link>
  );
}

export default SidebarRow; 