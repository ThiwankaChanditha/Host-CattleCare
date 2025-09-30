import { useNavigate } from 'react-router-dom';

const achievements = [
    { title: "First Farm Registered", description: "You registered your first farm.", icon: "🌱" },
    { title: "1000 Points!", description: "Achieved a score of 1000.", icon: "🏅" },
    { title: "Top 3 Rank", description: "You're now in the top 3!", icon: "🥉" },
];

export default function Achievements() {
    const navigate = useNavigate();

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Achievements</h2>
            <div className="space-y-4">
                {achievements.map((achieve, index) => (
                    <div key={index} className="flex items-start bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="text-3xl mr-4">{achieve.icon}</div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900">{achieve.title}</h4>
                            <p className="text-sm text-gray-600">{achieve.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-blue-100 rounded-lg hover:bg-green-200"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}
