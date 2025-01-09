import React from 'react';
import './SettingBar.css';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FeedbackIcon from '@mui/icons-material/Feedback';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import TranslateIcon from '@mui/icons-material/Translate';
import LanguageIcon from '@mui/icons-material/Language';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import DarkModeIcon from '@mui/icons-material/DarkMode';

function SettingBar() {
  const settings = [
    { icon: SettingsIcon, text: '설정' },
    { icon: HelpOutlineIcon, text: '고객센터' },
    { icon: FeedbackIcon, text: '의견 보내기' },
    { icon: KeyboardIcon, text: '단축키' },
    { icon: TranslateIcon, text: '언어: 한국어' },
    { icon: LanguageIcon, text: '위치: 대한민국' },
    { icon: SecurityIcon, text: '제한 모드: 사용 안함' },
    { icon: AccountBoxIcon, text: '계정' },
    { icon: DarkModeIcon, text: '디자인: 기기 테마' }
  ];

  return (
    <div className="settingBar">
      {settings.map((setting, index) => (
        <div key={index} className="settingBar__option">
          <setting.icon className="settingBar__icon" />
          <span>{setting.text}</span>
        </div>
      ))}
    </div>
  );
}

export default SettingBar;
