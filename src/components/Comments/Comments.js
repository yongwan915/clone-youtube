import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import './Comments.css';
import { API_BASE_URL } from '../../config';

function Comments({ videoId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const isLoggedIn = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  // 댓글 목록 가져오기
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/comments`);
        if (!response.ok) throw new Error('댓글 로딩 실패');
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('댓글 가져오기 실패:', error);
      }
    };

    if (videoId) {
      fetchComments();
    }
  }, [videoId]);

  // 새 댓글 작성
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('댓글을 작성하려면 로그인이 필요합니다.');
      return;
    }
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (!response.ok) throw new Error('댓글 작성 실패');
      
      const data = await response.json();
      setComments(prev => [data, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  // 댓글 수정
  const handleEdit = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: editContent })
      });

      if (!response.ok) throw new Error('댓글 수정 실패');

      setComments(prev => prev.map(comment => 
        comment.comment_id === commentId 
          ? { ...comment, content: editContent }
          : comment
      ));
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleDelete = async (commentId) => {
    if (!window.confirm('정말 이 댓글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('댓글 삭제 실패');

      setComments(prev => prev.filter(comment => comment.comment_id !== commentId));
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="comments">
      <h3>댓글 {comments.length}개</h3>

      {/* 댓글 작성 폼 */}
      <div className="comments__form">
        <Avatar 
          src="https://yt3.ggpht.com/ytc/default-avatar.jpg"
          alt={user?.user_name || "사용자"}
        />
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={isLoggedIn ? "댓글 추가..." : "댓글을 작성하려면 로그인하세요"}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!isLoggedIn}
          />
          {newComment && (
            <div className="comments__buttons">
              <button type="button" onClick={() => setNewComment('')}>취소</button>
              <button type="submit">댓글</button>
            </div>
          )}
        </form>
      </div>

      {/* 댓글 목록 */}
      <div className="comments__list">
        {comments.map(comment => (
          <div key={comment.comment_id} className="comment">
            <Avatar 
              src="https://yt3.ggpht.com/ytc/default-avatar.jpg"
              alt={comment.user_name}
            />
            <div className="comment__content">
              <div className="comment__header">
                <span className="comment__author">{comment.user_name}</span>
                <span className="comment__date">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              {editingId === comment.comment_id ? (
                <div className="comment__edit">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="comment__buttons">
                    <button onClick={() => setEditingId(null)}>취소</button>
                    <button onClick={() => handleEdit(comment.comment_id)}>저장</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="comment__text">{comment.content}</p>
                  {user && user.user_id === comment.user_id && (
                    <div className="comment__actions">
                      <button onClick={() => {
                        setEditingId(comment.comment_id);
                        setEditContent(comment.content);
                      }}>수정</button>
                      <button onClick={() => handleDelete(comment.comment_id)}>삭제</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Comments;