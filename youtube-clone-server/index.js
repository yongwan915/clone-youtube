const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();

// 미들웨어 설정
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));  // CORS 활성화
app.use(express.json());  // JSON 파싱
app.use(express.urlencoded({ extended: true }));  // URL-encoded 파싱
app.use('/public', express.static(path.join(__dirname, 'public'))); // 정적 파일 제공

// MySQL 연결 설정
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'mysql1234',
  database: 'youtube_clone',
  port: 3306
});

// DB 연결 테스트
const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log('MySQL 연결 성공!');
    connection.release();
  } catch (err) {
    console.error('MySQL 연결 에러:', err);
  }
};

testConnection();

// 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, 'public');
const bannersDir = path.join(uploadDir, 'banners');
const profilesDir = path.join(uploadDir, 'profiles');
const thumbnailsDir = path.join(uploadDir, 'thumbnails');
const videosDir = path.join(uploadDir, 'videos');

[uploadDir, bannersDir, profilesDir, thumbnailsDir, videosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 프로필/배너용 multer 설정
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = req.params.type;
    const uploadPath = type === 'banner' 
      ? path.join(__dirname, 'public', 'banners')
      : path.join(__dirname, 'public', 'profiles');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 비디오/썸네일용 multer 설정
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = file.fieldname === 'video'
      ? path.join(__dirname, 'public', 'videos')
      : path.join(__dirname, 'public', 'thumbnails');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // 파일 확장자 추출 및 소문자 변환
    const ext = path.extname(file.originalname).toLowerCase();
    // 이미지 파일 형식 검사 (썸네일의 경우)
    if (file.fieldname === 'thumbnail') {
      if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        return cb(new Error('지원하지 않는 이미지 형식입니다.'));
      }
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + ext);
  }
});

const uploadImage = multer({ storage: imageStorage });
const uploadVideo = multer({ storage: videoStorage });

// JWT 비밀키 설정
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';  // 환경 변수에서 가져오기

// JWT에서 user_id를 추출하는 함수 추가
function getUserIdFromToken(authHeader) {
    if (!authHeader) return null;  // 토큰이 없으면 null 반환
    
    try {
        // Bearer 토큰 형식 체크
        if (!authHeader.startsWith('Bearer ')) return null;
        
        const token = authHeader.split(' ')[1];
        if (!token) return null;  // 토큰이 비어있으면 null 반환
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        return decoded.user_id;
    } catch (error) {
        console.error('토큰 검증 실패:', error);
        return null;  // 토큰 검증 실패시 null 반환
    }
}

// 회원가입 API
app.post('/api/signup', async (req, res) => {
  try {
    const { login_id, password, user_name, email } = req.body;
    
    if (!login_id || !password || !user_name || !email) {
      return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }

    const sql = 'INSERT INTO users (login_id, password, user_name, email) VALUES (?, ?, ?, ?)';
    
    const [result] = await db.query(sql, [login_id, password, user_name, email]);
    res.json({ message: '회원가입 성공' });
    
  } catch (err) {
    console.error('SQL 에러:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: '이미 존재하는 아이디 또는 이메일입니다.' });
    }
    return res.status(500).json({ error: '회원가입 실패' });
  }
});

// 로그인 API
app.post('/api/login', async (req, res) => {
  try {
    const { login_id, password } = req.body;
    
    if (!login_id || !password) {
      return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
    }

    const query = 'SELECT * FROM users WHERE login_id = ? AND password = ?';
    const [results] = await db.query(query, [login_id, password]);
    
    if (results.length === 0) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign(
      { 
        user_id: results[0].user_id,
        login_id: results[0].login_id,
        user_name: results[0].user_name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      message: '로그인 성공',
      token,
      user: {
        user_id: results[0].user_id,
        login_id: results[0].login_id,
        user_name: results[0].user_name
      }
    });
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({ error: '로그인 실패' });
  }
});

// 비디오 업로드 API
app.post('/api/videos/upload', uploadVideo.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, upload_user_id } = req.body;
    const videoPath = `/public/videos/${req.files.video[0].filename}`;
    const thumbnailPath = `/public/thumbnails/${req.files.thumbnail[0].filename}`;

    const query = `
      INSERT INTO videos (
        upload_user_id, title, description, 
        video_url, thumbnail_url, views,
        created_at
      ) VALUES (?, ?, ?, ?, ?, 0, NOW())
    `;

    const [result] = await db.query(query, [
      upload_user_id,
      title,
      description,
      videoPath,
      thumbnailPath,
      0
    ]);

    res.json({ 
      message: '동영상 업로드 성공',
      video_id: result.insertId 
    });
  } catch (error) {
    console.error('동영상 업로드 에러:', error);
    res.status(500).json({ error: '동영상 업로드에 실패했습니다.' });
  }
});

// 비디오 목록 가져오기 API
app.get('/api/videos', async (req, res) => {
  try {
    const query = `
      SELECT 
        v.*,
        u.user_name,
        u.profile_image_url,
        (SELECT COUNT(*) FROM likes WHERE video_id = v.video_id) as likes_count,
        v.views as views
      FROM videos v
      JOIN users u ON v.upload_user_id = u.user_id
      ORDER BY v.created_at DESC
    `;
    
    const [videos] = await db.query(query);
    res.json(videos);
  } catch (error) {
    console.error('비디오 목록 조회 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
});

// 검색 API를 먼저 정의
app.get('/api/videos/search', async (req, res) => {
  try {
    const { q } = req.query;
    console.log('검색어:', q);
    
    if (!q) {
      return res.status(400).json({ error: '검색어를 입력해주세요.' });
    }

    const query = `
      SELECT 
        v.*,
        u.user_name,
        u.profile_image_url,
        (SELECT COUNT(*) FROM likes WHERE video_id = v.video_id) as likes_count
      FROM videos v
      JOIN users u ON v.upload_user_id = u.user_id
      WHERE 
        LOWER(v.title) LIKE LOWER(?) OR 
        LOWER(v.description) LIKE LOWER(?) OR 
        LOWER(u.user_name) LIKE LOWER(?)
      ORDER BY 
        v.created_at DESC
    `;

    const searchTerm = `%${q}%`;
    const [videos] = await db.query(query, [searchTerm, searchTerm, searchTerm]);
    
    console.log('검색 결과:', videos.length, '개 발견');
    return res.json(videos);
  } catch (error) {
    console.error('비디오 검색 에러:', error);
    return res.status(500).json({ error: '서버 에러' });
  }
});

// 그 다음에 비디오 상세 API 정의
app.get('/api/videos/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.headers.authorization ? getUserIdFromToken(req.headers.authorization) : null;

    let query = `
      SELECT 
        v.*,
        u.user_name,
        u.profile_image_url,
        (SELECT COUNT(*) FROM likes WHERE video_id = v.video_id) as likes_count,
        ${userId ? `(SELECT COUNT(*) > 0 FROM likes WHERE video_id = v.video_id AND user_id = ?) as is_liked,` : 'FALSE as is_liked,'}
        ${userId ? `(SELECT COUNT(*) > 0 FROM subscriptions WHERE subscriber_id = ? AND channel_user_id = v.upload_user_id) as is_subscribed` : 'FALSE as is_subscribed'}
      FROM videos v
      JOIN users u ON v.upload_user_id = u.user_id
      WHERE v.video_id = ?
    `;

    const queryParams = userId ? [userId, userId, videoId] : [videoId];
    const [video] = await db.query(query, queryParams);
    
    if (!video || video.length === 0) {
      return res.status(404).json({ error: '비디오를 찾을 수 없습니다.' });
    }

    video[0].is_liked = !!video[0].is_liked;
    video[0].is_subscribed = !!video[0].is_subscribed;

    res.json(video[0]);
  } catch (error) {
    console.error('비디오 조회 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
});

// JWT 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('받은 토큰:', token);

    if (!token) {
      return res.status(401).json({ error: '토큰이 없습니다.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('토큰 검증 에러:', err);
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: '토큰이 만료되었습니다.' });
        }
        if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
        }
        return res.status(403).json({ error: '토큰 검증 실패' });
      }

      console.log('디코딩된 토큰:', decoded);
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('인증 미들웨어 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
};

// 댓글 목록 조회 API
app.get('/api/videos/:videoId/comments', async (req, res) => {
  try {
    const { videoId } = req.params;
    const query = `
      SELECT 
        c.*,
        u.user_name,
        u.profile_image_url
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.video_id = ?
      ORDER BY c.created_at DESC
    `;

    const [comments] = await db.query(query, [videoId]);
    res.json(comments);
  } catch (error) {
    console.error('댓글 목록 조회 실패:', error);
    res.status(500).json({ error: '댓글 목록을 가져오는데 실패했습니다.' });
  }
});

// 댓글 작성 API
app.post('/api/videos/:videoId/comments', authenticateToken, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { content } = req.body;
    const user_id = req.user.user_id;

    console.log('댓글 작성 요청:', { videoId, content, user_id });

    // 비디오 존재 여부 확인
    const [video] = await db.query('SELECT video_id FROM videos WHERE video_id = ?', [videoId]);
    
    if (video.length === 0) {
      return res.status(404).json({ message: '존재하지 않는 비디오입니다.' });
    }

    const [result] = await db.query(`
      INSERT INTO comments 
      (video_id, user_id, content, created_at) 
      VALUES (?, ?, ?, NOW())
    `, [videoId, user_id, content]);

    // 새로 작성된 댓글 정보 조회 (profile_image 필드 제거)
    const [newComment] = await db.query(`
      SELECT 
        c.comment_id,
        c.video_id,
        c.user_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.user_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.comment_id = ?
    `, [result.insertId]);

    console.log('생성된 댓글:', newComment[0]);
    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error('댓글 작성 에러:', error);
    res.status(500).json({ 
      message: '서버 에러가 발생했습니다.',
      error: error.message 
    });
  }
});

// 댓글 수정 API
app.put('/api/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const user_id = req.user.user_id;

    const [comment] = await db.query(
      'SELECT user_id FROM comments WHERE comment_id = ?',
      [commentId]
    );

    if (comment.length === 0) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    if (comment[0].user_id !== user_id) {
      return res.status(403).json({ message: '댓글을 수정할 권한이 없습니다.' });
    }

    await db.query(`
      UPDATE comments 
      SET content = ?, updated_at = NOW() 
      WHERE comment_id = ?
    `, [content, commentId]);

    res.json({ message: '댓글이 수정되었습니다.' });
  } catch (error) {
    console.error('댓글 수정 에러:', error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 댓글 삭제 API
app.delete('/api/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const user_id = req.user.user_id;

    // 댓글 작성자 확인
    const [comment] = await db.query(
      'SELECT user_id FROM comments WHERE comment_id = ?',
      [commentId]
    );

    if (comment.length === 0) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    if (comment[0].user_id !== user_id) {
      return res.status(403).json({ message: '댓글을 삭제할 권한이 없습니다.' });
    }

    await db.query('DELETE FROM comments WHERE comment_id = ?', [commentId]);

    res.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('댓글 삭제 에러:', error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 채널(유저) 정보 조회 API
app.get('/api/channels/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('[채널 조회] 요청된 userId:', userId);
    
    const query = `
      SELECT 
        u.user_id,
        u.user_name,
        u.email,
        u.created_at,
        u.banner_image_url,
        u.profile_image_url,
        u.channel_description as description,
        (SELECT COUNT(*) FROM videos WHERE upload_user_id = u.user_id) as video_count,
        COALESCE((SELECT COUNT(*) FROM subscriptions WHERE channel_user_id = u.user_id), 0) as subscriber_count
      FROM users u
      WHERE u.user_id = ?
    `;
    
    const [results] = await db.query(query, [userId]);
    
    if (!results || results.length === 0) {
      return res.status(404).json({ error: '채널을 찾을 수 없습니다.' });
    }

    // DB에 이미 /public이 포함되어 있으므로 그대로 사용
    const channelData = {
      ...results[0]
    };

    res.status(200).json(channelData);
  } catch (error) {
    console.error('[채널 조회] 에러:', error);
    res.status(500).json({ error: '서버 에러', message: error.message });
  }
});

// 좋아요 추가/취소 API
app.post('/api/videos/:videoId/like', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { user_id } = req.body;  // 클라이언트에서 user_id 전달

    if (!user_id) {
      return res.status(400).json({ error: '로그인이 필요합니다.' });
    }

    // 이미 좋아요 했는지 확인
    const [existingLike] = await db.query(
      'SELECT * FROM likes WHERE user_id = ? AND video_id = ?',
      [user_id, videoId]
    );

    if (existingLike.length > 0) {
      await db.query(
        'DELETE FROM likes WHERE user_id = ? AND video_id = ?',
        [user_id, videoId]
      );
      res.json({ message: '좋아요가 취소되었습니다.', liked: false });
    } else {
      await db.query(
        'INSERT INTO likes (user_id, video_id) VALUES (?, ?)',
        [user_id, videoId]
      );
      res.json({ message: '좋아요가 추가되었습니다.', liked: true });
    }
  } catch (error) {
    console.error('좋아요 처리 중 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
});

// 구독/구독취소 API
app.post('/api/users/:channelUserId/subscribe', async (req, res) => {
  try {
    const { channelUserId } = req.params;
    const { user_id: subscriberId } = req.body;  // 클라이언트에서 user_id 전달

    if (!subscriberId) {
      return res.status(400).json({ error: '로그인이 필요합니다.' });
    }

    if (Number(channelUserId) === subscriberId) {
      return res.status(400).json({ error: '자기 자신을 구독할 수 없습니다.' });
    }

    const [existingSub] = await db.query(
      'SELECT * FROM subscriptions WHERE subscriber_id = ? AND channel_user_id = ?',
      [subscriberId, channelUserId]
    );

    if (existingSub.length > 0) {
      await db.query(
        'DELETE FROM subscriptions WHERE subscriber_id = ? AND channel_user_id = ?',
        [subscriberId, channelUserId]
      );
      return res.json({ message: '구독이 취소되었습니다.', subscribed: false });
    } else {
      await db.query(
        'INSERT INTO subscriptions (subscriber_id, channel_user_id) VALUES (?, ?)',
        [subscriberId, channelUserId]
      );
      return res.json({ message: '구독이 추가되었습니다.', subscribed: true });
    }
  } catch (error) {
    console.error('구독 처리 중 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
});

// 채널 구독자 목록 조회 API
app.get('/api/channels/:channelId/subscribers', async (req, res) => {
    try {
        const { channelId } = req.params;
        
        const [channel] = await db.query(
            'SELECT user_id FROM users WHERE user_id = ?',
            [channelId]
        );

        if (channel.length === 0) {
            return res.status(404).json({ error: '채널을 찾을 수 없습니다.' });
        }

        const query = `
            SELECT 
                u.user_id, 
                u.user_name,
                COALESCE(u.profile_image_url, '/default-profile.png') as profile_image_url
            FROM users u
            INNER JOIN subscriptions s ON u.user_id = s.subscriber_id
            WHERE s.channel_user_id = ?
            ORDER BY s.created_at DESC
        `;
        
        const [subscribers] = await db.query(query, [channelId]);
        res.json(subscribers || []);
    } catch (error) {
        console.error('구독자 목록 조회 중 상세 에러:', error);
        res.status(500).json({ 
            error: '서버 에러', 
            message: error.message
        });
    }
});

// 프로필/배너 업로드 API
app.post('/api/channels/:userId/image/:type', authenticateToken, uploadImage.single('image'), async (req, res) => {
  try {
    console.log('파일 업로드 요청:', req.file);
    console.log('파일 타입:', req.params.type);  // URL 파라미터에서 type 가져오기

    if (!req.file) {
      return res.status(400).json({ error: '파일이 없습니다.' });
    }

    const type = req.params.type;  // URL 파라미터에서 type 사용
    console.log('처리될 타입:', type);

    const uploadPath = type === 'banner' ? 'banners' : 'profiles';
    const imageUrl = `/public/${uploadPath}/${req.file.filename}`;
    console.log('최종 이미지 URL:', imageUrl);

    const updateField = type === 'banner' ? 'banner_image_url' : 'profile_image_url';
    console.log('업데이트될 DB 필드:', updateField);
    
    await db.query(
      `UPDATE users SET ${updateField} = ? WHERE user_id = ?`,
      [imageUrl, req.params.userId]
    );

    console.log('DB 업데이트 완료:', imageUrl);

    res.json({ 
      message: '이미지 업로드 성공',
      imageUrl 
    });
  } catch (error) {
    console.error('이미지 업로드 에러:', error);
    res.status(500).json({ error: '이미지 업로드에 실패했습니다.' });
  }
});

// 채널 설명 업데이트 API
app.put('/api/channels/:userId/description', authenticateToken, async (req, res) => {
  try {
    console.log('채널 설명 업데이트 요청 받음');
    console.log('인증된 사용자:', req.user);
    console.log('요청 userId:', req.params.userId);
    console.log('요청 바디:', req.body);

    const { userId } = req.params;
    const { description } = req.body;

    // 권한 체크
    if (req.user.user_id !== parseInt(userId)) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    // DB에 channel_description 컬럼이 있는지 확인하고 없으면 추가
    await db.query(
      'UPDATE users SET channel_description = ? WHERE user_id = ?',
      [description, userId]
    );

    res.json({ 
      message: '채널 설명이 업데이트되었습니다.',
      description 
    });
  } catch (error) {
    console.error('채널 설명 업데이트 에러:', error);
    res.status(500).json({ error: '채널 설명 업데이트에 실패했습니다.' });
  }
});

// 비디오 조회수 증가 API
app.post('/api/videos/:videoId/view', async (req, res) => {
  try {
    const { videoId } = req.params;
    await db.query('UPDATE videos SET views = views + 1 WHERE video_id = ?', [videoId]);
    res.json({ message: '조회수가 증가되었습니다.' });
  } catch (error) {
    console.error('조회수 증가 에러:', error);
    res.status(500).json({ error: '서버 에러' });
  }
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  res.status(500).json({ message: '서버 에러가 발생했습니다.' });
});

// 서버 시작
const port = 3001;  // 이 부분만 확인

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행중입니다.`);
});
