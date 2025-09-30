const translations = {
    forum: {
        en: {
            farmingForum: "Farming Forum",
            sortBy: "Sort by:",
            newest: "Newest",
            oldest: "Oldest",
            mostComments: "Most Comments",
            addQuestion: "Add Question",
            posting: "Posting...",
            noPosts: "No posts available yet. Be the first to ask a question!",
            loadingPosts: "Loading forum posts...",
            failedToLoad: "Failed to load forum posts. Please ensure the backend is running and data is seeded.",
            loginToPost: "Please log in to post questions or add replies."
        },
        si: {
            farmingForum: "ගොවිපල සංසදය",
            sortBy: "වර්ග කරන්න:",
            newest: "අලුත්ම",
            oldest: "පැරණිතම",
            mostComments: "වැඩිම අදහස්",
            addQuestion: "ප්‍රශ්නයක් එක් කරන්න",
            posting: "පළ කරමින්...",
            noPosts: "තවම පලකිරීම් නොමැත. ප්‍රශ්නයක් පළ කරන පළමුවැන්නා වන්න!",
            loadingPosts: "සංසදයේ පළකිරීම් පූරණය වෙමින් පවතී...",
            failedToLoad: "සංසදයේ පළකිරීම් පූරණය කිරීමට අසමත් විය. කරුණාකර backend ක්‍රියාත්මක වන බවට සහ දත්ත පවතින බවට සහතික වන්න.",
            loginToPost: "ප්‍රශ්න පළ කිරීමට හෝ පිළිතුරු එක් කිරීමට කරුණාකර පිවිසෙන්න."
        },
        ta: {
            farmingForum: "விவசாய மன்றம்",
            sortBy: "வரிசைப்படுத்து:",
            newest: "புதியது",
            oldest: "பழையது",
            mostComments: "அதிக கருத்துகள்",
            addQuestion: "கேள்வி சேர்க்கவும்",
            posting: "பதிவிடுகிறது...",
            noPosts: "இன்னும் பதிவுகள் இல்லை. முதலில் ஒரு கேள்வியைக் கேளுங்கள்!",
            loadingPosts: "மன்றப் பதிவுகளை ஏற்றுகிறது...",
            failedToLoad: "மன்றப் பதிவுகளை ஏற்ற முடியவில்லை. பின்தளம் இயங்குவதையும் தரவு உள்ளதையும் உறுதிப்படுத்தவும்.",
            loginToPost: "கேள்விகளைப் பதிவிட அல்லது பதில்களைச் சேர்க்க உள்நுழையவும்."
        }
    },
    addQuestionModal: {
        en: {
            addNewQuestion: "Add New Question",
            title: "Title",
            content: "Content",
            enterTitle: "Enter your question title",
            describeQuestion: "Describe your question in detail",
            cancel: "Cancel",
            postQuestion: "Post Question"
        },
        si: {
            addNewQuestion: "නව ප්‍රශ්නයක් එක් කරන්න",
            title: "මාතෘකාව",
            content: "අන්තර්ගතය",
            enterTitle: "ඔබගේ ප්‍රශ්නයේ මාතෘකාව ඇතුළත් කරන්න",
            describeQuestion: "ඔබගේ ප්‍රශ්නය විස්තරාත්මකව විස්තර කරන්න",
            cancel: "අවලංගු කරන්න",
            postQuestion: "ප්‍රශ්නය පළ කරන්න"
        },
        ta: {
            addNewQuestion: "புதிய கேள்வியைச் சேர்க்கவும்",
            title: "தலைப்பு",
            content: "உள்ளடக்கம்",
            enterTitle: "உங்கள் கேள்வியின் தலைப்பை உள்ளிடவும்",
            describeQuestion: "உங்கள் கேள்வியை விரிவாக விவரிக்கவும்",
            cancel: "ரத்துசெய்",
            postQuestion: "கேள்வியை இடுகையிடவும்"
        }
    },
    postItem: {
        en: {
            postedBy: "Posted by",
            unknownUser: "Unknown User",
            edited: "(Edited)",
            editPost: "Edit Post",
            deletePost: "Delete Post",
            cancelReply: "Cancel Reply",
            addReply: "Add Reply",
            viewAllComments: "View All Comments",
            replies: "Replies:",
            noReplies: "No replies yet.",
            yourReply: "Your Reply",
            writeReply: "Write your reply here",
            postReply: "Post Reply",
            by: "By",
            on: "on",
            edit: "Edit",
            save: "Save",
            delete: "Delete"
        },
        si: {
            postedBy: "පළ කරන ලද්දේ",
            unknownUser: "නොදන්නා පරිශීලක",
            edited: "(සංස්කරණය කරන ලදී)",
            editPost: "පළ කිරීම සංස්කරණය කරන්න",
            deletePost: "පළ කිරීම මකන්න",
            cancelReply: "පිළිතුර අවලංගු කරන්න",
            addReply: "පිළිතුරක් එක් කරන්න",
            viewAllComments: "සියලු අදහස් බලන්න",
            replies: "පිළිතුරු:",
            noReplies: "තවම පිළිතුරු නොමැත.",
            yourReply: "ඔබගේ පිළිතුර",
            writeReply: "ඔබගේ පිළිතුර මෙහි ලියන්න",
            postReply: "පිළිතුර පළ කරන්න",
            by: "විසින්",
            on: "මත",
            edit: "සංස්කරණය කරන්න",
            save: "සුරකින්න",
            delete: "මකන්න"
        },
        ta: {
            postedBy: "பதிவிட்டவர்",
            unknownUser: "அறியப்படாத பயனர்",
            edited: "(திருத்தப்பட்டது)",
            editPost: "பதிவை திருத்து",
            deletePost: "பதிவை நீக்கு",
            cancelReply: "பதிலை ரத்துசெய்",
            addReply: "பதில் சேர்க்கவும்",
            viewAllComments: "அனைத்து கருத்துகளையும் காண்க",
            replies: "பதில்கள்:",
            noReplies: "இன்னும் பதில்கள் இல்லை.",
            yourReply: "உங்கள் பதில்",
            writeReply: "உங்கள் பதிலை இங்கே எழுதவும்",
            postReply: "பதிலை இடுகையிடவும்",
            by: "மூலம்",
            on: "இல்",
            edit: "திருத்து",
            save: "சேமி",
            delete: "நீக்கு"
        }
    },
    confirmModal: {
        en: {
            confirmDeletion: "Confirm Deletion",
            confirmPostDelete: "Are you sure you want to delete this post and all its comments? This action cannot be undone.",
            confirmCommentDelete: "Are you sure you want to delete this comment? This action cannot be undone.",
            cancel: "Cancel",
            delete: "Delete"
        },
        si: {
            confirmDeletion: "මැකීම තහවුරු කරන්න",
            confirmPostDelete: "ඔබට මෙම පළ කිරීම සහ එහි සියලුම අදහස් මකා දැමීමට අවශ්‍ය බව සහතිකද? මෙම ක්‍රියාව ආපසු හැරවිය නොහැක.",
            confirmCommentDelete: "ඔබට මෙම අදහස මකා දැමීමට අවශ්‍ය බව සහතිකද? මෙම ක්‍රියාව ආපසු හැරවිය නොහැක.",
            cancel: "අවලංගු කරන්න",
            delete: "මකන්න"
        },
        ta: {
            confirmDeletion: "நீக்குதலை உறுதிப்படுத்தவும்",
            confirmPostDelete: "இந்த இடுகையையும் அதன் அனைத்து கருத்துகளையும் நீக்க விரும்புகிறீர்களா? இந்தச் செயலைத் திரும்பப் பெற முடியாது.",
            confirmCommentDelete: "இந்த கருத்தை நீக்க விரும்புகிறீர்களா? இந்தச் செயலைத் திரும்பப் பெற முடியாது.",
            cancel: "ரத்துசெய்",
            delete: "நீக்கு"
        }
    },
    postPagination: {
        en: {
            previousPage: "Previous Page",
            nextPage: "Next Page",
            pageOf: "Page {currentPage} of {totalPages}"
        },
        si: {
            previousPage: "පෙර පිටුව",
            nextPage: "ඊළඟ පිටුව",
            pageOf: "පිටුව {currentPage} න් {totalPages}"
        },
        ta: {
            previousPage: "முந்தைய பக்கம்",
            nextPage: "அடுத்த பக்கம்",
            pageOf: "பக்கம் {currentPage} இல் {totalPages}"
        }
    },
    allCommentsModal: {
        en: {
            post: "Post:",
            allReplies: "All Replies:"
        },
        si: {
            post: "පළ කිරීම:",
            allReplies: "සියලු පිළිතුරු:"
        },
        ta: {
            post: "பதிவு:",
            allReplies: "அனைத்து பதில்கள்:"
        }
    }
};

export default translations;
