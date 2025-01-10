import Home from '../pages/Home/Home';
import Trending from '../pages/Trending/Trending';
import Subscriptions from '../pages/Subscriptions/Subscriptions';
import History from '../pages/History/History';
import MyVideos from '../pages/MyVideos/MyVideos';
import Notifications from '../pages/Notifications/Notifications';
import Music from '../pages/Music/Music';
import Shopping from '../pages/Shopping/Shopping';
import Live from '../pages/Live/Live';
import Games from '../pages/Games/Games';
import Sports from '../pages/Sports/Sports';
import Login from '../pages/Login/Login';
import SignUp from '../pages/Signup/SignUp';
import CreateVideo from '../pages/CreateVideo/CreateVideo';


const routes = [
    {
        path: '/',
        element: Home,
        name: '홈',
        type: ['sidebar']
    },
    {
        path: '/trending',
        element: Trending,
        name: '인기',
        type: ['sidebar']
    },
    {
        path: '/subscriptions',
        element: Subscriptions,
        name: '구독',
        type: ['sidebar']
    },
    {
        type: ['sidebar-divider']
    },
    {
        path: '/myvideos',
        element: MyVideos,
        name: '내 페이지',
        type: ['sidebar']
    },
    {
        path: '/history',
        element: History,
        name: '시청 기록',
        type: ['sidebar']
    },
    {
        type: ['sidebar-login']
    },
    {
        type: ['sidebar-subtitle'],
        name: '탐색'
    },
    {
        path: '/shopping',
        element: Shopping,
        name: '쇼핑',
        type: ['sidebar']
    },
    {
        path: '/music',
        element: Music,
        name: '음악',
        type: ['sidebar']
    },
    {
        path: '/live',
        element: Live,
        name: '라이브',
        type: ['sidebar']
    },
    {
        path: '/games',
        element: Games,
        name: '게임',
        type: ['sidebar']
    },
    {
        path: '/sports',
        element: Sports,
        name: '스포츠',
        type: ['sidebar']
    },
    {
        path: '/notifications',
        element: Notifications,
        name: '알림',
        type: ['header']
    },
    {
        path: '/login',
        element: Login,
        name: '로그인',
        type: ['header']
    },
    {
        path: '/sign-up',
        element: SignUp,
        name: '회원가입',
        type: []
    },
    {
        path: '/create-video',
        element: CreateVideo,
        name: '동영상 업로드',
        type: ['page']
    }
];

export default routes; 