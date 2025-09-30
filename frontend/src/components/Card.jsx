/* eslint-disable no-unused-vars */
import 'flowbite';
import { useLanguage } from '../context/LanguageContext';

const colorClasses = {
    blue: {
        from: "from-sky-300",
        to: "to-blue-500",
    },
    red: {
        from: "from-red-400",
        to: "to-red-600",
    },
    green: {
        from: "from-lime-400",
        to: "to-emerald-600",
    },
    purple: {
        from: "from-purple-400",
        to: "to-fuchsia-600",
    },
    teal: {
        from: "from-teal-300",
        to: "to-cyan-600",
    },
};

const translations = {
    en: {
        totalSales: "Total Sales",
        newUsers: "New Users",
        revenue: "Revenue",
        growth: "Growth",
        increase: "Increase",
        decrease: "Decrease",
        defaultTitle: "Metric",
        defaultChange: "Change",
        farmsCount: "FARMS",
        cattleCount: "CATTLE COUNT",
        calvingsCount: "CALVINGS COUNT",
        milkCollection: "MILK COLLECTION",
        sales: "SALES",
        notApplicable: "N/A",
    },
    si: {
        totalSales: "සම්පූර්ණ විකුණුම්",
        newUsers: "නව පරිශීලකයින්",
        revenue: "ආදායම",
        growth: "වර්ධනය",
        increase: "ඉහළ යාම",
        decrease: "අඩු වීම",
        defaultTitle: "මිනුම",
        defaultChange: "වෙනස් වීම",
        farmsCount: "ගොවිපල ගණන",
        cattleCount: "ගව ගණන",
        calvingsCount: "ගව ප්‍රසූත ගණන",
        milkCollection: "කිරි එකතුව",
        sales: "විකුණුම්",
        notApplicable: "අදාළ නොවේ",
    },
    ta: {
        totalSales: "மொத்த விற்பனை",
        newUsers: "புதிய பயனர்கள்",
        revenue: "வருமானம்",
        growth: "வளர்ச்சி",
        increase: "வளர்ச்சி",
        decrease: "குறைவு",
        defaultTitle: "மெட்ரிக்",
        defaultChange: "மாற்றம்",
        farmsCount: "பண்ணைகள்",
        cattleCount: "கால்நடைகளின் எண்ணிக்கை",
        calvingsCount: "கன்று ஈன்ற எண்ணிக்கை",
        milkCollection: "பால் சேகரிப்பு",
        sales: "விற்பனை",
        notApplicable: "பொருந்தாது"
    },
};

export default function Card({ title, value, change, icon: Icon, color = "blue" }) {
    const { language } = useLanguage();
    const t = translations[language];

    const fromClass = colorClasses[color]?.from || "from-sky-300";
    const toClass = colorClasses[color]?.to || "to-blue-500";

    const translatedTitle = t[title] || title;
    const translatedChange = t[change] || change;

    return (
        <div className="w-full h-full p-4">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col justify-between space-y-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-500 uppercase tracking-wider">{translatedTitle}</h3>

                    {/* Icon Container */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${fromClass} ${toClass} shadow-md`}>
                        {Icon && <Icon size={24} className="text-white" />}
                    </div>
                </div>

                {/* Value */}
                <div className="text-4xl font-extrabold text-gray-800">{value}</div>
            </div>
        </div>
    );
}