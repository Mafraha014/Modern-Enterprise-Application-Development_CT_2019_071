import React from 'react';

const Chart = ({ data, type, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-secondary-500"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  if (type === 'bar') {
    const maxValue = Math.max(...data.map(item => item.count || 0));
    
    return (
      <div className="space-y-3" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-24 text-sm text-secondary-600">
              {item._id?.semester} {item._id?.year}
            </div>
            <div className="flex-1 ml-4">
              <div className="flex items-center">
                <div 
                  className="bg-primary-600 rounded h-6 transition-all duration-300"
                  style={{ 
                    width: `${((item.count || 0) / maxValue) * 100}%`,
                    minWidth: '20px'
                  }}
                ></div>
                <span className="ml-2 text-sm text-secondary-700">
                  {item.count || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + (item.count || 0), 0);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            {data.map((item, index) => {
              const percentage = total > 0 ? (item.count || 0) / total : 0;
              const circumference = 2 * Math.PI * 60; // radius = 60
              const strokeDasharray = circumference * percentage;
              const strokeDashoffset = circumference - strokeDasharray;
              const color = colors[index % colors.length];
              
              return (
                <circle
                  key={index}
                  cx="96"
                  cy="96"
                  r="60"
                  fill="none"
                  stroke={color}
                  strokeWidth="20"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-900">{total}</div>
              <div className="text-sm text-secondary-600">Total</div>
            </div>
          </div>
        </div>
        
        <div className="ml-8 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm text-secondary-700">
                {item._id}: {item.count || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center text-secondary-500"
      style={{ height }}
    >
      Chart type not supported
    </div>
  );
};

export default Chart; 