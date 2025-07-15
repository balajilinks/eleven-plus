import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './DataVisualization.css';

const DataVisualization = ({ type, data, title, xKey, yKey, options = {} }) => {
    const {
        width = '100%',
        height = 300,
        colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
        showLegend = true,
        showTooltip = true,
        showGrid = true
    } = options;

    const renderChart = () => {
        switch (type) {
            case 'bar':
                return (
                    <ResponsiveContainer width={width} height={height}>
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                            <XAxis dataKey={xKey || "name"} />
                            <YAxis />
                            {showTooltip && <Tooltip />}
                            {showLegend && <Legend />}
                            <Bar dataKey={yKey || "value"} fill={colors[0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'line':
                return (
                    <ResponsiveContainer width={width} height={height}>
                        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                            <XAxis dataKey={xKey || "name"} />
                            <YAxis />
                            {showTooltip && <Tooltip />}
                            {showLegend && <Legend />}
                            <Line type="monotone" dataKey={yKey || "value"} stroke={colors[0]} strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width={width} height={height}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey={yKey || "value"}
                                nameKey={xKey || "name"}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            {showTooltip && <Tooltip />}
                            {showLegend && <Legend />}
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'table':
                return (
                    <div className="data-table">
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(data[0] || {}).map((key) => (
                                        <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((value, cellIndex) => (
                                            <td key={cellIndex}>{value}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'histogram':
                return (
                    <ResponsiveContainer width={width} height={height}>
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                            <XAxis dataKey={xKey || "range"} />
                            <YAxis />
                            {showTooltip && <Tooltip />}
                            {showLegend && <Legend />}
                            <Bar dataKey={yKey || "frequency"} fill={colors[1]} />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'scatter':
                return (
                    <ResponsiveContainer width={width} height={height}>
                        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                            <XAxis dataKey={xKey || "x"} />
                            <YAxis dataKey={yKey || "y"} />
                            {showTooltip && <Tooltip />}
                            {showLegend && <Legend />}
                            <Line
                                type="monotone"
                                dataKey={yKey || "y"}
                                stroke={colors[2]}
                                strokeWidth={0}
                                dot={{ fill: colors[2], strokeWidth: 2, r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            default:
                return <div className="chart-error">Unsupported chart type: {type}</div>;
        }
    };

    return (
        <div className="data-visualization">
            {title && <h4 className="chart-title">{title}</h4>}
            <div className="chart-container">
                {renderChart()}
            </div>
        </div>
    );
};

export default DataVisualization;
