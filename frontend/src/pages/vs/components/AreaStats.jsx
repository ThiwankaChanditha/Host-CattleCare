const AreaStats = ({
    activeFarms,
    totalCattle,
    totalFarmers,
    ldiCount,
    activeProjects,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Area Statistics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Active Farms</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                        {activeFarms}
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Total Cattle</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                        {totalCattle}
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Total Farmers</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                        {totalFarmers}
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">LDIs</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                        {ldiCount}
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Active Projects</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                        {activeProjects}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AreaStats;
