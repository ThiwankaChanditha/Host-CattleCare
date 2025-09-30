/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PlusCircleIcon, MessageCircleIcon, EditIcon, XIcon, XCircleIcon, Trash2Icon,
  ChevronLeft, ChevronRight, SortAsc, SortDesc, MessageSquareText, LogInIcon,
  ArrowRightCircle, UserIcon, ThumbsUpIcon, Share2Icon, AlertTriangleIcon, MoreVerticalIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from "../../components/ToastNotification"

const translations = {
  en: {
    confirmDeletionTitle: 'Confirm Deletion',
    confirmDeletePostMessage: 'Are you sure you want to delete this post and all its comments? This action cannot be undone.',
    confirmDeleteCommentMessage: 'Are you sure you want to delete this comment? This action cannot be undone.',
    cancel: 'Cancel',
    delete: 'Delete',
    farmingForum: 'Farming Forum',
    sortByNewest: 'Sort by: Newest',
    sortByOldest: 'Sort by: Oldest',
    sortByMostComments: 'Sort by: Most Comments',
    addQuestion: 'Add Question',
    posting: 'Posting...',
    addReply: 'Add Reply',
    cancelReply: 'Cancel Reply',
    viewAllComments: 'View All Comments',
    yourReply: 'Your Reply',
    postReply: 'Post Reply',
    postingReply: 'Posting...',
    noPostsAvailable: 'No posts available yet. Be the first to ask a question!',
    loadingForumPosts: 'Loading forum posts...',
    failedToLoadPosts: 'Failed to load forum posts. Please ensure the backend is running and data is seeded.',
    pleaseFillTitleContent: 'Please fill in both the title and content.',
    mustBeLoggedInToPostQuestion: 'You must be logged in to post a question.',
    mustBeLoggedInToPostReply: 'You must be logged in to post a reply.',
    mustBeLoggedInToEditComment: 'You must be logged in to edit a comment.',
    mustBeLoggedInToEditPost: 'You must be logged in to edit a post.',
    mustBeLoggedInToDelete: 'You must be logged in to delete.',
    commentCannotBeEmpty: 'Comment cannot be empty.',
    titleContentCannotBeEmpty: 'Title and content cannot be empty.',
    commentDeletedSuccessfully: 'Comment deleted successfully!',
    postDeletedSuccessfully: 'Post deleted successfully!',
    failedToAddQuestion: 'Failed to add question:',
    failedToAddReply: 'Failed to add reply:',
    failedToEditComment: 'Failed to edit comment:',
    failedToEditPost: 'Failed to edit post:',
    failedToDelete: 'Failed to delete',
    pleaseLoginToPost: 'Please log in to post questions or add replies.',
    editPost: 'Edit Post',
    savePost: 'Save Post',
    edit: 'Edit',
    deleteText: 'Delete',
    postedBy: 'Posted by',
    on: 'on',
    allReplies: 'All Replies',
    by: 'By',
    unknownUser: 'Unknown User',
    nextPage: "Next Page",
    previousPage: "Previous Page",
    replies: 'Replies',
    deleteMsg: 'Are you sure you want to delete this comment? This action cannot be undone.'
  },
  si: {
    confirmDeletionTitle: 'මකන්න තහවුරු කරන්න',
    confirmDeletePostMessage: 'ඔබට මෙම පෝස්ට් සහ එහි සියලුම ප්‍රතිචාර මකන්න අවශ්‍යද? මෙම ක්‍රියාව අහෝසි කළ නොහැක.',
    confirmDeleteCommentMessage: 'ඔබට මෙම ප්‍රතිචාරය මකන්න අවශ්‍යද? මෙම ක්‍රියාව අහෝසි කළ නොහැක.',
    cancel: 'අවලංගු කරන්න',
    delete: 'මකන්න',
    farmingForum: 'කෘෂිකාර්මික සංවාද මණ්ඩලය',
    sortByNewest: 'අලුත්ම අනුව වර්ගීකරණය කරන්න',
    sortByOldest: 'පැරණිම අනුව වර්ගීකරණය කරන්න',
    sortByMostComments: 'අධික ප්‍රතිචාර අනුව වර්ගීකරණය කරන්න',
    addQuestion: 'ප්‍රශ්නයක් එක් කරන්න',
    posting: 'පළ කිරීම...',
    addReply: 'ප්‍රතිචාරයක් එක් කරන්න',
    cancelReply: 'ප්‍රතිචාරය අවලංගු කරන්න',
    viewAllComments: 'සියලු ප්‍රතිචාර බලන්න',
    yourReply: 'ඔබගේ ප්‍රතිචාරය',
    postReply: 'ප්‍රතිචාරය පළ කරන්න',
    postingReply: 'පළ කිරීම...',
    noPostsAvailable: 'තවමත් පෝස්ට් නොමැත. පළමු ප්‍රශ්නය ඔබ විසින් ඉදිරිපත් කරන්න!',
    loadingForumPosts: 'සංවාද මණ්ඩලයේ පෝස්ට් පූරණය වෙමින් පවතී...',
    failedToLoadPosts: 'සංවාද මණ්ඩලයේ පෝස්ට් පූරණය කිරීම අසාර්ථක විය. කරුණාකර පසුබැසීම ක්‍රියාත්මක බව සහ දත්ත පිරවීම සිදු වී ඇති බව තහවුරු කරන්න.',
    pleaseFillTitleContent: 'ශීර්ෂය සහ අන්තර්ගතය පිරවීමට කරුණාකර.',
    mustBeLoggedInToPostQuestion: 'ප්‍රශ්නයක් පළ කිරීමට ඔබ ලොග් විය යුතුය.',
    mustBeLoggedInToPostReply: 'ප්‍රතිචාරයක් පළ කිරීමට ඔබ ලොග් විය යුතුය.',
    mustBeLoggedInToEditComment: 'ප්‍රතිචාරයක් සංස්කරණය කිරීමට ඔබ ලොග් විය යුතුය.',
    mustBeLoggedInToEditPost: 'පෝස්ට් එකක් සංස්කරණය කිරීමට ඔබ ලොග් විය යුතුය.',
    mustBeLoggedInToDelete: 'මකන්න ඔබ ලොග් විය යුතුය.',
    commentCannotBeEmpty: 'ප්‍රතිචාරය හිස් විය නොහැක.',
    titleContentCannotBeEmpty: 'ශීර්ෂය සහ අන්තර්ගතය හිස් විය නොහැක.',
    commentDeletedSuccessfully: 'ප්‍රතිචාරය සාර්ථකව මකා දමන ලදී!',
    postDeletedSuccessfully: 'පෝස්ට් එක සාර්ථකව මකා දමන ලදී!',
    failedToAddQuestion: 'ප්‍රශ්නය එක් කිරීමට අසමත් විය:',
    failedToAddReply: 'ප්‍රතිචාරය එක් කිරීමට අසමත් විය:',
    failedToEditComment: 'ප්‍රතිචාරය සංස්කරණය කිරීමට අසමත් විය:',
    failedToEditPost: 'පෝස්ට් එක සංස්කරණය කිරීමට අසමත් විය:',
    failedToDelete: 'මකන්න අසමත් විය',
    pleaseLoginToPost: 'ප්‍රශ්න හෝ ප්‍රතිචාර එක් කිරීමට කරුණාකර පිවිසෙන්න.',
    editPost: 'පෝස්ට් එක සංස්කරණය කරන්න',
    savePost: 'පෝස්ට් එක සුරකින්න',
    edit: 'සංස්කරණය කරන්න',
    deleteText: 'මකන්න',
    postedBy: 'පෝස්ට් කළේ',
    on: 'දිනය',
    allReplies: 'සියලු ප්‍රතිචාර',
    by: 'පිළිතුරු දුන්',
    unknownUser: 'නොදන්නා පරිශීලක',
    nextPage: "ඊළඟ පිටුව",
    previousPage: "පෙර පිටුව",
    replies: 'පිළිතුරු',
    deleteMsg: 'ඔබට මෙම අදහස මකා දැමීමට අවශ්‍ය බව ඔබට විශ්වාසද? මෙම ක්‍රියාව ආපසු හැරවිය නොහැක.'
  },
  ta: {
    confirmDeletionTitle: 'நீக்குவதை உறுதிப்படுத்தவும்',
    confirmDeletePostMessage: 'இந்த பதிவையும் அதனுடன் தொடர்புடைய அனைத்து பதில்களையும் நீக்க விரும்புகிறீர்களா? இந்த நடவடிக்கை திரும்பப்பெற முடியாது.',
    confirmDeleteCommentMessage: 'இந்த கருத்தையும் நீக்க விரும்புகிறீர்களா? இந்த நடவடிக்கை திரும்பப்பெற முடியாது.',
    cancel: 'ரத்து செய்',
    delete: 'நீக்கு',
    farmingForum: 'விவசாயக் கருத்தரங்கம்',
    sortByNewest: 'புதியவை முதலில்',
    sortByOldest: 'பழையவை முதலில்',
    sortByMostComments: 'அதிகமான கருத்துக்கள்',
    addQuestion: 'கேள்வி சேர்க்கவும்',
    posting: 'பதிவு செய்யப்படுகிறது...',
    addReply: 'பதில் சேர்க்கவும்',
    cancelReply: 'பதில் ரத்து செய்',
    viewAllComments: 'அனைத்து கருத்துக்களையும் காண்க',
    yourReply: 'உங்கள் பதில்',
    postReply: 'பதில் பதிவு செய்',
    postingReply: 'பதிவு செய்யப்படுகிறது...',
    noPostsAvailable: 'இன்னும் பதிவுகள் இல்லை. முதலில் கேள்வி கேளுங்கள்!',
    loadingForumPosts: 'கருத்தரங்க பதிவுகள் ஏற்றப்படுகிறது...',
    failedToLoadPosts: 'கருத்தரங்க பதிவுகளை ஏற்ற முடியவில்லை. பின்புலம் இயங்குகிறது மற்றும் தரவு ஏற்றப்பட்டுள்ளது என்பதை உறுதிப்படுத்தவும்.',
    pleaseFillTitleContent: 'தலைப்பு மற்றும் உள்ளடக்கத்தை நிரப்பவும்.',
    mustBeLoggedInToPostQuestion: 'கேள்வி கேட்க உள்நுழைய வேண்டும்.',
    mustBeLoggedInToPostReply: 'பதில் அளிக்க உள்நுழைய வேண்டும்.',
    mustBeLoggedInToEditComment: 'கருத்தை திருத்த உள்நுழைய வேண்டும்.',
    mustBeLoggedInToEditPost: 'பதிவை திருத்த உள்நுழைய வேண்டும்.',
    mustBeLoggedInToDelete: 'நீக்க உள்நுழைய வேண்டும்.',
    commentCannotBeEmpty: 'கருத்து காலியாக இருக்க முடியாது.',
    titleContentCannotBeEmpty: 'தலைப்பு மற்றும் உள்ளடக்கம் காலியாக இருக்க முடியாது.',
    commentDeletedSuccessfully: 'கருத்து வெற்றிகரமாக நீக்கப்பட்டது!',
    postDeletedSuccessfully: 'பதிவு வெற்றிகரமாக நீக்கப்பட்டது!',
    failedToAddQuestion: 'கேள்வி சேர்க்க முடியவில்லை:',
    failedToAddReply: 'பதில் சேர்க்க முடியவில்லை:',
    failedToEditComment: 'கருத்தை திருத்த முடியவில்லை:',
    failedToEditPost: 'பதிவை திருத்த முடியவில்லை:',
    failedToDelete: 'நீக்க முடியவில்லை',
    pleaseLoginToPost: 'கேள்விகள் அல்லது பதில்கள் பதிவுசெய்ய உள்நுழையவும்.',
    editPost: 'பதிவை திருத்தவும்',
    savePost: 'பதிவை சேமிக்கவும்',
    edit: 'திருத்தவும்',
    deleteText: 'நீக்கு',
    nextPage: "அடுத்த பக்கம்",
    previousPage: "முந்தைய பக்கம்",
    replies: 'பதில்கள்',
    deleteMsg: 'இந்த கருத்தை நீக்க விரும்புகிறீர்களா? இந்த செயலை மீண்டும் மாற்ற முடியாது.'
  }
};

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  const { language } = useLanguage();
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4">
        {/* Modal Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          {/* Modal Header with subtle gradient */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 pb-0">
            <div className="flex justify-end">
              <button
                onClick={onCancel}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-center -mt-2">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="px-6 py-4 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.confirmDeletionTitle}</h2>
            <p className="text-gray-600 text-sm mb-6">{t.deleteMsg}</p>
          </div>

          {/* Modal Actions - Divider and Buttons */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                {t.cancel}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2 px-4 bg-red-600 rounded-lg text-white font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AllCommentsModal = ({ isOpen, onClose, post }) => {
  const { language } = useLanguage();
  const t = translations[language];

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-start z-50 backdrop-blur-sm bg-black/30 pt-8">
      <div className="bg-white rounded-2xl shadow-2xl w-[700px] max-w-[95%] mx-auto flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              onClick={onClose}
            >
              <XIcon className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t.allReplies}</h2>
              <p className="text-sm text-gray-500">{post.comments?.length || 0} comments</p>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {post.author_id?.full_name || post.author_id?.username || t.unknownUser}
                </h3>
                <span className="text-xs text-gray-500">
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-2">{post.title}</h4>
              <p className="text-gray-700 leading-relaxed">{post.content}</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <div key={comment._id} className="flex items-start space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-sm text-gray-900">
                        {comment.author_id?.full_name || comment.author_id?.username || t.unknownUser}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircleIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">{t.noRepliesYet}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Forum() {
  const { language } = useLanguage();
  const t = translations[language];

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);

  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const [showCommentBoxForPostId, setShowCommentBoxForPostId] = useState(null);
  const [newCommentTexts, setNewCommentTexts] = useState({});
  const [submittingPost, setSubmittingPost] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState('');

  const [editingPostId, setEditingPostId] = useState(null);
  const [editedPostTitle, setEditedPostTitle] = useState('');
  const [editedPostContent, setEditedPostContent] = useState('');

  const [sortOrder, setSortOrder] = useState('newest');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteActionType, setDeleteActionType] = useState('');

  const [showAllCommentsModal, setShowAllCommentsModal] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);

  const [currentPostsPage, setCurrentPostsPage] = useState(1);
  const postsPerPage = 5;

  const { user: currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPosts();
    setCurrentPostsPage(1);
  }, [currentUser, sortOrder]);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = currentUser?.id ? { Authorization: currentUser.id } : {};
      const response = await axios.get(`/api/forum?sort=${sortOrder}`, { headers });
      setPosts(response.data);
      setLoading(false);
    } catch (err) {
      setError(t.failedToLoadPosts);
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.title || !newQuestion.content) {
      showError(t.pleaseFillTitleContent);
      return;
    }
    if (!currentUser || !currentUser.id) {
      showError(t.mustBeLoggedInToPostQuestion);
      return;
    }

    setSubmittingPost(true);
    try {
      const headers = { Authorization: currentUser.id };
      await axios.post(
        '/api/forum',
        {
          title: newQuestion.title,
          content: newQuestion.content,
        },
        { headers }
      );
      await fetchPosts();
      setNewQuestion({ title: '', content: '' });
      setShowAddQuestionModal(false);
    } catch {
      showError(`${t.failedToAddQuestion} An error occurred.`);
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleAddComment = async (postId) => {
    const content = newCommentTexts[postId]?.trim();

    if (!content) {
      showError(t.commentCannotBeEmpty);
      return;
    }
    if (!currentUser || !currentUser.id) {
      showError(t.mustBeLoggedInToPostReply);
      return;
    }

    setSubmittingComment(true);
    try {
      const headers = { Authorization: currentUser.id };
      const response = await axios.post(
        `/api/forum/${postId}/comments`,
        { content },
        { headers }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
              ...post,
              comments: [
                ...(post.comments || []),
                {
                  ...response.data.comment,
                  author_id: {
                    _id: currentUser.id,
                    username: currentUser.username,
                    full_name: currentUser.full_name
                  }
                },
              ],
            }
            : post
        )
      );

      setNewCommentTexts((prev) => ({ ...prev, [postId]: '' }));
      setShowCommentBoxForPostId(null);
    } catch (err) {
      showError(`${t.failedToAddReply} ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId, postId) => {
    if (!editedCommentContent.trim()) {
      showError(t.commentCannotBeEmpty);
      return;
    }
    if (!currentUser || !currentUser.id) {
      showError(t.mustBeLoggedInToEditComment);
      return;
    }

    try {
      const headers = { Authorization: currentUser.id };
      const response = await axios.put(
        `/api/forum/${postId}/comments/${commentId}`,
        { content: editedCommentContent },
        { headers }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment._id === commentId ? { ...comment, content: response.data.comment.content } : comment
              ),
            }
            : post
        )
      );
      setEditingCommentId(null);
      setEditedCommentContent('');
    } catch (err) {
      showError(`${t.failedToEditComment} ${err.response?.data?.message || err.message}`);
    }
  };

  const confirmDeleteComment = (commentId, postId) => {
    setItemToDelete({ id: commentId, parentId: postId });
    setDeleteActionType('comment');
    setShowDeleteConfirmModal(true);
  };

  const confirmDeletePost = (postId) => {
    setItemToDelete({ id: postId });
    setDeleteActionType('post');
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirmModal(false);

    if (!currentUser || !currentUser.id) {
      showError(t.mustBeLoggedInToDelete);
      return;
    }

    try {
      const headers = { Authorization: currentUser.id };
      if (deleteActionType === 'comment') {
        await axios.delete(
          `/api/forum/${itemToDelete.parentId}/comments/${itemToDelete.id}`,
          { headers }
        );
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === itemToDelete.parentId
              ? {
                ...post,
                comments: post.comments.filter((comment) => comment._id !== itemToDelete.id),
              }
              : post
          )
        );
        showSuccess(t.commentDeletedSuccessfully);
      } else if (deleteActionType === 'post') {
        await axios.delete(
          `/api/forum/${itemToDelete.id}`,
          { headers }
        );
        setPosts((prevPosts) => prevPosts.filter((post) => post._id !== itemToDelete.id));
        showSuccess(t.postDeletedSuccessfully);
      }
    } catch (err) {
      showError(`${t.failedToDelete} ${deleteActionType}: ${err.response?.data?.message || err.message}`);
    } finally {
      setItemToDelete(null);
      setDeleteActionType('');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
    setDeleteActionType('');
  };

  const handleEditPost = async (postId) => {
    if (!editedPostTitle.trim() || !editedPostContent.trim()) {
      showError(t.titleContentCannotBeEmpty);
      return;
    }
    if (!currentUser || !currentUser.id) {
      showError(t.mustBeLoggedInToEditPost);
      return;
    }

    try {
      const headers = { Authorization: currentUser.id };
      const response = await axios.put(
        `/api/forum/${postId}`,
        { title: editedPostTitle, content: editedPostContent },
        { headers }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, title: response.data.post.title, content: response.data.post.content, updated_at: response.data.post.updated_at }
            : post
        )
      );
      setEditingPostId(null);
      setEditedPostTitle('');
      setEditedPostContent('');
    } catch (err) {
      showError(`${t.failedToEditPost} ${err.response?.data?.message || err.message}`);
    }
  };

  const indexOfLastPost = currentPostsPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPostsPages = Math.ceil(posts.length / postsPerPage);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <p className="text-lg text-gray-700">{t.loadingForumPosts}</p>
    </div>
  );
  if (error) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <p className="text-red-600 text-lg font-semibold">{error}</p>
    </div>
  );

  return (
    <div className="p-8 min-h-screen bg-gray-50 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          {/* <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <MessageSquareText className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t.farmingForum}</h1> */}
        </div>
        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none pr-8"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">{t.sortByNewest}</option>
              <option value="oldest">{t.sortByOldest}</option>
              <option value="most_comments">{t.sortByMostComments}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              {sortOrder === 'newest' && <SortDesc className="h-5 w-5" />}
              {sortOrder === 'oldest' && <SortAsc className="h-5 w-5" />}
              {sortOrder === 'most_comments' && <MessageSquareText className="h-5 w-5" />}
            </div>
          </div>

          <button
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 flex items-center gap-2
                                ${submittingPost || !currentUser
                ? 'bg-blue-300 cursor-not-allowed opacity-70'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              }`}
            onClick={() => setShowAddQuestionModal(true)}
            disabled={submittingPost || !currentUser}
          >
            <PlusCircleIcon className="h-5 w-5" />
            {submittingPost ? t.posting : t.addQuestion}
          </button>
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-[500px] max-w-[90%] mx-auto transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{t.addQuestion}</h2>
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                onClick={() => {
                  setShowAddQuestionModal(false);
                  setNewQuestion({ title: "", content: "" });
                }}
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="questionTitle" className="block text-sm font-medium text-gray-700 mb-2">{t.addQuestion} Title</label>
                <input
                  id="questionTitle"
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder={t.addQuestion}
                  disabled={submittingPost}
                />
              </div>
              <div>
                <label htmlFor="questionContent" className="block text-sm font-medium text-gray-700 mb-2">{t.addQuestion} Content</label>
                <textarea
                  id="questionContent"
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder={t.addQuestion}
                  disabled={submittingPost}
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-200">
              <button
                className="px-6 py-2 text-gray-700 rounded-full hover:bg-gray-100 transition-colors duration-200 font-medium"
                onClick={() => {
                  setShowAddQuestionModal(false);
                  setNewQuestion({ title: "", content: "" });
                }}
                disabled={submittingPost}
              >
                {t.cancel}
              </button>
              <button
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-200
                                    ${submittingPost
                    ? 'bg-blue-300 cursor-not-allowed opacity-70'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  }`}
                onClick={handleAddQuestion}
                disabled={submittingPost}
              >
                {submittingPost ? t.posting : t.addQuestion}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {currentPosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquareText className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">{t.noPostsAvailable}</p>
            <p className="text-gray-500 text-sm mt-2">Be the first to start a conversation!</p>
          </div>
        ) : (
          currentPosts.map((post) => {
            const commentsToDisplayInitially = 3;
            const hasMoreComments = (post.comments?.length || 0) > commentsToDisplayInitially;
            const visibleComments = post.comments?.slice(0, commentsToDisplayInitially) || [];

            return (
              <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Post Header */}
                <div className="p-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {post.author_id?.full_name || post.author_id?.username || t.unknownUser}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{new Date(post.created_at).toLocaleString()}</span>
                          {post.updated_at && post.created_at !== post.updated_at && (
                            <span className="ml-1">· {t.edit}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Post Action Buttons (Edit & Delete) */}
                    {currentUser && currentUser.id === post.author_id?._id && (
                      <div className="relative group">
                        <button className="text-gray-500 hover:text-gray-700 p-1">
                          <MoreVerticalIcon className="h-5 w-5" />
                        </button>
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block z-10">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => {
                              setEditingPostId(post._id);
                              setEditedPostTitle(post.title);
                              setEditedPostContent(post.content);
                            }}
                          >
                            <EditIcon className="h-4 w-4" /> {t.editPost}
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            onClick={() => confirmDeletePost(post._id)}
                          >
                            <Trash2Icon className="h-4 w-4" /> {t.deleteText}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                {editingPostId === post._id ? (
                  // Editing Post View
                  <div className="px-4 pb-4">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editedPostTitle}
                        onChange={(e) => setEditedPostTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-semibold"
                      />
                      <textarea
                        rows={4}
                        value={editedPostContent}
                        onChange={(e) => setEditedPostContent(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      ></textarea>
                      <div className="flex justify-end gap-2">
                        <button
                          className="px-4 py-2 text-gray-700 rounded-full hover:bg-gray-100 transition-colors duration-200 font-medium"
                          onClick={() => {
                            setEditingPostId(null);
                            setEditedPostTitle('');
                            setEditedPostContent('');
                          }}
                        >
                          {t.cancel}
                        </button>
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 font-medium"
                          onClick={() => handleEditPost(post._id)}
                        >
                          {t.savePost}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Normal Post View
                  <>
                    <div className="px-4 pb-3">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{post.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{post.content}</p>
                    </div>

                    {/* Post Actions */}
                    <div className="px-4 py-3 border-t border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <button
                            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                            onClick={() => setShowCommentBoxForPostId(showCommentBoxForPostId === post._id ? null : post._id)}
                          >
                            <MessageCircleIcon className="h-5 w-5" />
                            <span className="text-sm font-medium">
                              {post.comments?.length || 0} {t.replies}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inline Comment Box */}
                    {showCommentBoxForPostId === post._id && (
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserIcon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-2xl px-4 py-3">
                              <textarea
                                rows={3}
                                className="w-full bg-transparent focus:outline-none resize-none placeholder-gray-500"
                                placeholder={t.yourReply}
                                value={newCommentTexts[post._id] || ''}
                                onChange={(e) => setNewCommentTexts(prev => ({ ...prev, [post._id]: e.target.value }))}
                                disabled={submittingComment}
                              ></textarea>
                            </div>
                            <div className="flex justify-end mt-3">
                              <button
                                className="px-4 py-2 text-gray-700 rounded-full hover:bg-gray-100 transition-colors duration-200 font-medium mr-2"
                                onClick={() => {
                                  setShowCommentBoxForPostId(null);
                                  setNewCommentTexts(prev => ({ ...prev, [post._id]: '' }));
                                }}
                                disabled={submittingComment}
                              >
                                {t.cancel}
                              </button>
                              <button
                                className={`px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 font-medium
                                                            ${submittingComment ? 'opacity-70 cursor-not-allowed' : ''}`}
                                onClick={() => handleAddComment(post._id)}
                                disabled={submittingComment}
                              >
                                {submittingComment ? t.postingReply : t.postReply}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Comments Section */}
                    {(post.comments?.length || 0) > 0 && (
                      <div className="divide-y divide-gray-100">
                        {visibleComments.map((comment) => (
                          <div key={comment._id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <UserIcon className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                {editingCommentId === comment._id ? (
                                  <div className="space-y-3">
                                    <textarea
                                      rows={3}
                                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                                      value={editedCommentContent}
                                      onChange={(e) => setEditedCommentContent(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-end gap-2">
                                      <button
                                        className="px-4 py-2 text-gray-700 rounded-full hover:bg-gray-100 transition-colors duration-200 font-medium"
                                        onClick={() => {
                                          setEditingCommentId(null);
                                          setEditedCommentContent('');
                                        }}
                                      >
                                        {t.cancel}
                                      </button>
                                      <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 font-medium"
                                        onClick={() => handleEditComment(comment._id, post._id)}
                                      >
                                        {t.savePost}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-semibold text-sm text-gray-900">
                                        {comment.author_id?.full_name || comment.author_id?.username || 'Unknown User'}
                                      </h4>
                                      <div className="text-xs text-gray-500">
                                        {new Date(comment.created_at).toLocaleString()}
                                      </div>
                                    </div>
                                    <p className="text-gray-700 mb-2">{comment.content}</p>
                                    <div className="flex items-center space-x-4">
                                      {currentUser && currentUser.id === comment.author_id?._id && (
                                        <div className="flex items-center space-x-4">
                                          <button
                                            className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm"
                                            onClick={() => {
                                              setEditingCommentId(comment._id);
                                              setEditedCommentContent(comment.content);
                                            }}
                                          >
                                            <EditIcon className="h-4 w-4" />
                                            <span>{t.edit}</span>
                                          </button>
                                          <button
                                            className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors duration-200 text-sm"
                                            onClick={() => confirmDeleteComment(comment._id, post._id)}
                                          >
                                            <Trash2Icon className="h-4 w-4" />
                                            <span>{t.deleteText}</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* View All Comments Button */}
                    {hasMoreComments && (
                      <div className="px-4 py-3 bg-gray-50">
                        <button
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center w-full"
                          onClick={() => {
                            setSelectedPostForComments(post);
                            setShowAllCommentsModal(true);
                          }}
                        >
                          {t.viewAllComments} {post.comments.length}
                          <ArrowRightCircle className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Post Pagination Controls */}
      {posts.length > postsPerPage && (
        <div className="flex justify-center items-center mt-8 p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
          <button
            className={`px-6 py-2 rounded-full transition-all duration-200 flex items-center gap-2
                                    ${currentPostsPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            onClick={() => setCurrentPostsPage(prev => prev - 1)}
            disabled={currentPostsPage === 1}
          >
            <ChevronLeft className="h-5 w-5" /> {t.previousPage}
          </button>
          <span className="mx-4 text-lg font-medium text-gray-700">
            {t.page} {currentPostsPage} {t.of} {totalPostsPages}
          </span>
          <button
            className={`px-6 py-2 rounded-full transition-all duration-200 flex items-center gap-2
                                    ${currentPostsPage === totalPostsPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            onClick={() => setCurrentPostsPage(prev => prev + 1)}
            disabled={currentPostsPage === totalPostsPages}
          >
            {t.nextPage} <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {!isAuthenticated && (
        <div className="mt-8 p-4 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <LogInIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Log in to participate</p>
            <p className="text-gray-600 text-sm">Please log in to post questions or add replies to the farming community.</p>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        message={deleteActionType === 'post'
          ? "Are you sure you want to delete this post and all its comments? This action cannot be undone."
          : "Are you sure you want to delete this comment? This action cannot be undone."
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* All Comments Modal */}
      <AllCommentsModal
        isOpen={showAllCommentsModal}
        onClose={() => {
          setShowAllCommentsModal(false);
          setSelectedPostForComments(null);
        }}
        post={selectedPostForComments}
      />
    </div>
  );
};