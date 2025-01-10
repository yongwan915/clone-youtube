import React from 'react';
import { useLocation } from 'react-router-dom';
import './Sidebar.css';
import SidebarRow from './SidebarRow';
import HomeIcon from '@mui/icons-material/Home';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import HistoryIcon from '@mui/icons-material/History';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import StreamIcon from '@mui/icons-material/Stream';
import routes from '../../routes/routes';
import LoginButton from '../Button/LoginButton';
import CreateVideo from '../Button/CreateVideoButton';

function Sidebar({ isOpen }) {
  const location = useLocation();
  
  // 로그인 상태 체크
  const isLoggedIn = localStorage.getItem('token');

  const getIcon = (path) => {
    switch (path) {
      case '/':
        return HomeIcon;
      case '/trending':
        return WhatshotIcon;
      case '/subscription':
        return SubscriptionsIcon;
      case '/myvideos':
        return VideoLibraryIcon;
      case '/history':
        return HistoryIcon;
      case '/shopping':
        return ShoppingBagIcon;
      case '/music':
        return MusicNoteIcon;
      case '/live':
        return StreamIcon;
      case '/games':
        return SportsEsportsIcon;
      case '/sports':
        return SportsSoccerIcon;
      default:
        return HomeIcon;
    }
  };

  const renderSidebarItem = (item) => {
    if (!isOpen && !item.type.includes('sidebar')) {
      return null;
    }

    if (item.type.includes('sidebar-divider')) {
      return isOpen ? <hr key={Math.random()} /> : null;
    }
    
    if (item.type.includes('sidebar-subtitle')) {
      return isOpen ? <h3 key={item.name} className="sidebar__subtitle">{item.name}</h3> : null;
    }
    
    if (item.type.includes('sidebar-login')) {
      return isOpen && !isLoggedIn ? (
        <div key="login" className="sidebar__login">
          <p>로그인하면 동영상에 좋아요를 표시하고 댓글을 달거나 구독할 수 있습니다.</p>
          <LoginButton isLoggedIn={isLoggedIn} />
        </div>
      ) : null;
    }

    if (item.type.includes('create-video')) {
      return isLoggedIn ? (
        <div key="create-video" className="sidebar__create-video">
          {/* <CreateVideo /> */}
        </div>
      ) : null;
    }

    if (item.type.includes('sidebar')) {
      return (
        <SidebarRow
          key={item.path}
          selected={location.pathname === item.path}
          Icon={getIcon(item.path)}
          title={item.name}
          href={item.path}
          isOpen={isOpen}
        />
      );
    }

    return null;
  };

  return (
    <div className={`sidebar ${!isOpen ? 'sidebar--closed' : ''}`}>
      {routes.map(renderSidebarItem)}
    </div>
  );
}

export default Sidebar; 