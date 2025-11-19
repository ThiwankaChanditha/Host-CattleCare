// src/utils/translations.js
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
            loginToPost: "Please log in to post questions or add replies.",
            fillInFields: "Please fill in both the title and content.",
            failedToAddQuestion: "Failed to add question",
            loginToEdit: "You must be logged in to edit.",
            loginToDelete: "You must be logged in to delete.",
            failedToDeleteItem: "Failed to delete item",
            failedToEditPost: "Failed to edit post"
        },
        si: { // Sinhala translations
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
            loginToPost: "ප්‍රශ්න පළ කිරීමට හෝ පිළිතුරු එක් කිරීමට කරුණාකර පිවිසෙන්න.",
            fillInFields: "කරුණාකර මාතෘකාව සහ අන්තර්ගතය යන දෙකම පුරවන්න.",
            failedToAddQuestion: "ප්‍රශ්නය එක් කිරීමට අසමත් විය",
            loginToEdit: "සංස්කරණය කිරීමට ඔබ පිවිසිය යුතුය.",
            loginToDelete: "මකා දැමීමට ඔබ පිවිසිය යුතුය.",
            failedToDeleteItem: "අයිතමය මකා දැමීමට අසමත් විය",
            failedToEditPost: "පළ කිරීම සංස්කරණය කිරීමට අසමත් විය"
        },
        ta: { // Tamil translations
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
            loginToPost: "கேள்விகளைப் பதிவிட அல்லது பதில்களைச் சேர்க்க உள்நுழையவும்.",
            fillInFields: "தயவுசெய்து தலைப்பு மற்றும் உள்ளடக்கம் இரண்டையும் நிரப்பவும்.",
            failedToAddQuestion: "கேள்வியை சேர்க்க முடியவில்லை",
            loginToEdit: "திருத்த உள்நுழைய வேண்டும்.",
            loginToDelete: "நீக்க உள்நுழைய வேண்டும்.",
            failedToDeleteItem: "உறுப்பினை நீக்க முடியவில்லை",
            failedToEditPost: "பதிவை திருத்த முடியவில்லை"
        }
    },
    forgotPassword: {
        en: {
            title: 'Reset Password',
            emailPlaceholder: 'Enter your email',
            sendOTP: 'Send OTP',
            otpPlaceholder: 'Enter 6-digit OTP',
            verifyOTP: 'Verify OTP',
            newPasswordPlaceholder: 'Enter new password',
            confirmPasswordPlaceholder: 'Confirm new password',
            resetPassword: 'Reset Password',
            backToLogin: 'Back to Login',
            resendOTP: 'Resend OTP',
            otpExpiresIn: 'OTP expires in',
            passwordMismatch: 'Passwords do not match',
            passwordTooShort: 'Password must be at least 6 characters',
            successMessage: 'Password reset successful! You can now login.',
            close: 'Close',
            sending: 'Sending...',
            verifying: 'Verifying...',
            resetting: 'Resetting...'
        },
        si: {
            title: 'මුරපදය යළි පිහිටුවන්න',
            emailPlaceholder: 'ඔබගේ විද්‍යුත් තැපෑල ඇතුළත් කරන්න',
            sendOTP: 'OTP එවන්න',
            otpPlaceholder: 'ඉලක්කම් 6ක OTP ඇතුළත් කරන්න',
            verifyOTP: 'OTP සත්‍යාපනය කරන්න',
            newPasswordPlaceholder: 'නව මුරපදය ඇතුළත් කරන්න',
            confirmPasswordPlaceholder: 'මුරපදය තහවුරු කරන්න',
            resetPassword: 'මුරපදය යළි පිහිටුවන්න',
            backToLogin: 'පිවිසුමට ආපසු',
            resendOTP: 'OTP නැවත එවන්න',
            otpExpiresIn: 'OTP කල් ඉකුත් වන්නේ',
            passwordMismatch: 'මුරපද ගැලපෙන්නේ නැත',
            passwordTooShort: 'මුරපදය අවම වශයෙන් අක්ෂර 6ක් විය යුතුය',
            successMessage: 'මුරපදය සාර්ථකව යළි පිහිටුවන ලදී! දැන් ඔබට පිවිසිය හැක.',
            close: 'වසන්න',
            sending: 'එවමින්...',
            verifying: 'සත්‍යාපනය කරමින්...',
            resetting: 'යළි පිහිටුවමින්...'
        },
        ta: {
            title: 'கடவுச்சொல்லை மீட்டமைக்கவும்',
            emailPlaceholder: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
            sendOTP: 'OTP அனுப்பவும்',
            otpPlaceholder: '6 இலக்க OTP உள்ளிடவும்',
            verifyOTP: 'OTP சரிபார்க்கவும்',
            newPasswordPlaceholder: 'புதிய கடவுச்சொல்லை உள்ளிடவும்',
            confirmPasswordPlaceholder: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
            resetPassword: 'கடவுச்சொல்லை மீட்டமைக்கவும்',
            backToLogin: 'உள்நுழைவுக்கு திரும்பு',
            resendOTP: 'OTP மீண்டும் அனுப்பவும்',
            otpExpiresIn: 'OTP காலாவதியாகிறது',
            passwordMismatch: 'கடவுச்சொற்கள் பொருந்தவில்லை',
            passwordTooShort: 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும்',
            successMessage: 'கடவுச்சொல் வெற்றிகரமாக மீட்டமைக்கப்பட்டது! இப்போது நீங்கள் உள்நுழையலாம்.',
            close: 'மூடு',
            sending: 'அனுப்புகிறது...',
            verifying: 'சரிபார்க்கிறது...',
            resetting: 'மீட்டமைக்கிறது...'
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
        si: { // Sinhala translations
            addNewQuestion: "නව ප්‍රශ්නයක් එක් කරන්න",
            title: "මාතෘකාව",
            content: "අන්තර්ගතය",
            enterTitle: "ඔබගේ ප්‍රශ්නයේ මාතෘකාව ඇතුළත් කරන්න",
            describeQuestion: "ඔබගේ ප්‍රශ්නය විස්තරාත්මකව විස්තර කරන්න",
            cancel: "අවලංගු කරන්න",
            postQuestion: "ප්‍රශ්නය පළ කරන්න"
        },
        ta: { // Tamil translations
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
            on: "on", // as in "on [date]"
            edit: "Edit", // for comments
            save: "Save", // for edits
            delete: "Delete", // for comments
            replyEmpty: "Reply cannot be empty.",
            commentEmpty: "Comment cannot be empty.",
            failedToAddReply: "Failed to add reply",
            failedToEditComment: "Failed to edit comment",
            commentDeleted: "Comment deleted successfully!",
            postDeleted: "Post deleted successfully!"
        },
        si: { // Sinhala translations
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
            on: "මත", // as in "on [date]"
            edit: "සංස්කරණය කරන්න", // for comments
            save: "සුරකින්න", // for edits
            delete: "මකන්න", // for comments
            replyEmpty: "පිළිතුර හිස් විය නොහැක.",
            commentEmpty: "අදහස හිස් විය නොහැක.",
            failedToAddReply: "පිළිතුර එක් කිරීමට අසමත් විය",
            failedToEditComment: "අදහස සංස්කරණය කිරීමට අසමත් විය",
            commentDeleted: "අදහස සාර්ථකව මකා දමන ලදී!",
            postDeleted: "පළ කිරීම සාර්ථකව මකා දමන ලදී!"
        },
        ta: { // Tamil translations
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
            on: "இல்", // as in "on [date]"
            edit: "திருத்து", // for comments
            save: "சேமி", // for edits
            delete: "நீக்கு", // for comments
            replyEmpty: "பதில் காலியாக இருக்க முடியாது.",
            commentEmpty: "கருத்து காலியாக இருக்க முடியாது.",
            failedToAddReply: "பதிலை சேர்க்க முடியவில்லை",
            failedToEditComment: "கருத்தை திருத்த முடியவில்லை",
            commentDeleted: "கருத்து வெற்றிகரமாக நீக்கப்பட்டது!",
            postDeleted: "பதிவு வெற்றிகரமாக நீக்கப்பட்டது!"
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
        si: { // Sinhala translations
            confirmDeletion: "මැකීම තහවුරු කරන්න",
            confirmPostDelete: "ඔබට මෙම පළ කිරීම සහ එහි සියලුම අදහස් මකා දැමීමට අවශ්‍ය බව සහතිකද? මෙම ක්‍රියාව ආපසු හැරවිය නොහැක.",
            confirmCommentDelete: "ඔබට මෙම අදහස මකා දැමීමට අවශ්‍ය බව සහතිකද? මෙම ක්‍රියාව ආපසු හැරවිය නොහැක.",
            cancel: "අවලංගු කරන්න",
            delete: "මකන්න"
        },
        ta: { // Tamil translations
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
        si: { // Sinhala translations
            previousPage: "පෙර පිටුව",
            nextPage: "ඊළඟ පිටුව",
            pageOf: "පිටුව {currentPage} න් {totalPages}"
        },
        ta: { // Tamil translations
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
        si: { // Sinhala translations
            post: "පළ කිරීම:",
            allReplies: "සියලු පිළිතුරු:"
        },
        ta: { // Tamil translations
            post: "பதிவு:",
            allReplies: "அனைத்து பதில்கள்:"
        }
    },
    achievements: { // New section for achievements
        en: {
            yourAchievements: "Your Achievements",
            goBack: "Go Back",
            achievementList: [
                { title: "First Farm Registered", description: "You registered your first farm.", icon: "🌱" },
                { title: "1000 Points!", description: "Achieved a score of 1000.", icon: "🏅" },
                { title: "Top 3 Rank", description: "You're now in the top 3!", icon: "🥉" },
                { title: "5 Farms Owned", description: "You own 5 active farms.", icon: "🏡" },
                { title: "Master Farmer", description: "Reached the highest farmer rank.", icon: "👑" },
                { title: "Community Contributor", description: "Posted 10 questions or replies in the forum.", icon: "🗣️" },
            ]
        },
        es: {
            yourAchievements: "Tus Logros",
            goBack: "Volver",
            achievementList: [
                { title: "Primera Granja Registrada", description: "Registraste tu primera granja.", icon: "🌱" },
                { title: "¡1000 Puntos!", description: "Alcanzaste una puntuación de 1000.", icon: "🏅" },
                { title: "Top 3 en el Ranking", description: "¡Estás ahora entre los 3 mejores!", icon: "🥉" },
                { title: "5 Granjas Propias", description: "Posees 5 granjas activas.", icon: "🏡" },
                { title: "Maestro Agricultor", description: "Alcanzaste el rango más alto de agricultor.", icon: "👑" },
                { title: "Colaborador de la Comunidad", description: "Publicaste 10 preguntas o respuestas en el foro.", icon: "🗣️" },
            ]
        },
        si: { // Sinhala translations
            yourAchievements: "ඔබගේ ජයග්‍රහණ",
            goBack: "ආපසු යන්න",
            achievementList: [
                { title: "පළමු ගොවිපල ලියාපදිංචි කිරීම", description: "ඔබ ඔබේ පළමු ගොවිපල ලියාපදිංචි කළා.", icon: "🌱" },
                { title: "ලකුණු 1000!", description: "ලකුණු 1000ක් ලබා ගත්තා.", icon: "🏅" },
                { title: "ඉහළම 3 ශ්‍රේණිය", description: "ඔබ දැන් ඉහළම 3 තුළ සිටී!", icon: "🥉" },
                { title: "ගොවිපල 5ක හිමිකරු", description: "ඔබ ක්‍රියාකාරී ගොවිපල 5ක හිමිකරුවෙකි.", icon: "🏡" },
                { title: "ප්‍රධාන ගොවියා", description: "ඉහළම ගොවි ශ්‍රේණියට පැමිණ ඇත.", icon: "👑" },
                { title: "ප්‍රජා දායකයා", description: "සංසදයේ ප්‍රශ්න හෝ පිළිතුරු 10ක් පළ කළා.", icon: "🗣️" },
            ]
        },
        ta: { // Tamil translations
            yourAchievements: "உங்கள் சாதனைகள்",
            goBack: "பின் செல்லவும்",
            achievementList: [
                { title: "முதல் பண்ணை பதிவு செய்யப்பட்டது", description: "உங்கள் முதல் பண்ணையை பதிவு செய்துள்ளீர்கள்.", icon: "🌱" },
                { title: "1000 புள்ளிகள்!", description: "1000 மதிப்பெண் அடைந்தீர்கள்.", icon: "🏅" },
                { title: "முதல் 3 ரேங்க்", description: "நீங்கள் இப்போது முதல் 3 இல் உள்ளீர்கள்!", icon: "🥉" },
                { title: "5 பண்ணைகள் சொந்தமாக", description: "நீங்கள் 5 செயலில் உள்ள பண்ணைகளை வைத்திருக்கிறீர்கள்.", icon: "🏡" },
                { title: "முதன்மை விவசாயி", description: "உயர்ந்த விவசாயி தரத்தை அடைந்தார்.", icon: "👑" },
                { title: "சமூக பங்களிப்பாளர்", description: "மன்றத்தில் 10 கேள்விகள் அல்லது பதில்களை இடுகையிட்டீர்கள்.", icon: "🗣️" },
            ]
        }
    },
    profile: {
        en: {
            profile: "Profile",
            totalScore: "Total Score",
            availableFarms: "Available Farms",
            starRating: "Star Rating",
            editProfile: "Edit Profile",
            viewAchievements: "View Achievements",
            quickStats: "Quick Stats",
            currentRank: "Current Rank",
            pointsToNextRank: "Points to Next Rank",
            activeFarms: "Active Farms",
            leaderboard: "Leaderboard",
            topPerformingFarmers: "Top performing farmers in your region",
            rank: "Rank",
            farmer: "Farmer",
            score: "Score",
            rating: "Rating",
            you: "You",
        },
        si: {
            profile: "පැතිකඩ",
            totalScore: "සම්පූර්ණ ලකුණු",
            availableFarms: "ලබා ගත හැකි ගොවිපළ",
            starRating: "තරඟ තරඟකාරීත්වය",
            editProfile: "පැතිකඩ සංස්කරණය කරන්න",
            viewAchievements: "සම්මාන බලන්න",
            quickStats: "ඉක්මන් සංඛ්‍යාත",
            currentRank: "වත්මන් ශ්‍රේණිය",
            pointsToNextRank: "ඊළඟ ශ්‍රේණියට ලකුණු",
            activeFarms: "සක්‍රීය ගොවිපළ",
            leaderboard: "නායක මණ්ඩලය",
            topPerformingFarmers: "ඔබගේ ප්‍රදේශයේ ඉහළම කෘෂිකර්මිකයින්",
            rank: "ශ්‍රේණිය",
            farmer: "ගොවිපළ",
            score: "ලකුණු",
            rating: "තරඟකාරීත්වය",
            you: "ඔබ",
        },
        ta: {
            profile: "சுயவிவரம்",
            totalScore: "மொத்த மதிப்பெண்கள்",
            availableFarms: "கிடைக்கும் பண்ணைகள்",
            starRating: "நட்சத்திர மதிப்பீடு",
            editProfile: "சுயவிவரத்தைத் திருத்து",
            viewAchievements: "சாதனைகளைப் பார்க்கவும்",
            quickStats: "விரைவு புள்ளிவிவரங்கள்",
            currentRank: "தற்போதைய தரம்",
            pointsToNextRank: "அடுத்த தரத்திற்கு புள்ளிகள்",
            activeFarms: "செயலில் உள்ள பண்ணைகள்",
            leaderboard: "தலைமை பட்டியல்",
            topPerformingFarmers: "உங்கள் பிரதேசத்தில் சிறந்த விவசாயிகள்",
            rank: "தரம்",
            farmer: "விவசாயி",
            score: "மதிப்பெண்கள்",
            rating: "மதிப்பீடு",
            you: "நீங்கள்",
        },
    },
    login: { // New section for login page
        en: {
            welcomeTitle: "Welcome to CattleCare",
            tagline: "CattleCare helps you manage your farm, appointments, and veterinary tasks efficiently.",
            loginTitle: "Login to your account",
            emailLabel: "Email",
            passwordLabel: "Password",
            showPassword: "Show",
            hidePassword: "Hide",
            loginButton: "Login",
            loggingInButton: "Logging in...",
            forgotPassword: "Forgot Password?",
            invalidRoleError: "Invalid role/dashboard information received.",
            loginFailedError: "Login failed. Please check your network or credentials.",
            copyright: "All rights reserved."
        },
        si: { // Sinhala translations for login
            welcomeTitle: "CattleCare වෙත සාදරයෙන් පිළිගනිමු",
            tagline: "CattleCare ඔබට ඔබේ ගොවිපල, පත්වීම් සහ පශු වෛද්‍ය කාර්යයන් කාර්යක්ෂමව කළමනාකරණය කිරීමට උපකාරී වේ.",
            loginTitle: "ඔබගේ ගිණුමට පිවිසෙන්න",
            emailLabel: "විද්‍යුත් තැපෑල",
            passwordLabel: "මුරපදය",
            showPassword: "පෙන්වන්න",
            hidePassword: "සඟවන්න",
            loginButton: "පිවිසෙන්න",
            loggingInButton: "පිවිසෙමින්...",
            forgotPassword: "මුරපදය අමතකද?",
            invalidRoleError: "වලංගු නොවන භූමිකාව/පාලක පැනල තොරතුරු ලැබුණි.",
            loginFailedError: "පිවිසීම අසාර්ථක විය. කරුණාකර ඔබගේ ජාලය හෝ අක්තපත්‍ර පරීක්ෂා කරන්න.",
            copyright: "සියලුම හිමිකම් ඇවිරිණි."
        },
        ta: { // Tamil translations for login
            welcomeTitle: "கால்நடை பராமரிப்புக்கு வருக",
            tagline: "உங்கள் பண்ணை, சந்திப்புகள் மற்றும் கால்நடை பணிகளை திறம்பட நிர்வகிக்க கால்நடை பராமரிப்பு உதவுகிறது.",
            loginTitle: "உங்கள் கணக்கில் உள்நுழைக",
            emailLabel: "மின்னஞ்சல்",
            passwordLabel: "கடவுச்சொல்",
            showPassword: "காட்டு",
            hidePassword: "மறை",
            loginButton: "உள்நுழை",
            loggingInButton: "உள்நுழைகிறது...",
            forgotPassword: "கடவுச்சொல்லை மறந்துவிட்டீர்களா?",
            invalidRoleError: "தவறான பங்கு/கட்டுப்பாட்டுப் பலகத் தகவல் பெறப்பட்டது.",
            loginFailedError: "உள்நுழைவு தோல்வியடைந்தது. உங்கள் பிணையம் அல்லது சான்றுகளை சரிபார்க்கவும்.",
            copyright: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை."
        }
    }
};

export default translations;
