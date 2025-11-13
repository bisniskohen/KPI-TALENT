import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  type: 'currency' | 'number';
}

interface SalesMetricsChartProps {
  data: ChartData[];
}

const SalesMetricsChart: React.FC<SalesMetricsChartProps> = ({ data }) => {
  const formatYAxis = (value: number, type: 'currency' | 'number') => {
    if (type === 'currency') {
      if (value >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toFixed(1)}M`;
      if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)}jt`;
      if (value >= 1_000) return `Rp${(value / 1_000).toFixed(1)}rb`;
      return `Rp${value}`;
    }
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}M`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}rb`;
    return value.toLocaleString('id-ID');
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
          const data = payload[0].payload;
          const formattedValue = data.type === 'currency'
              ? `Rp ${payload[0].value.toLocaleString('id-ID')}`
              : payload[0].value.toLocaleString('id-ID');

          return (
              <div className="p-2 border rounded-md bg-card border-border-color">
                  <p className="label text-text-primary">{`${label}`}</p>
                  <p className="intro text-text-secondary">{`Value: ${formattedValue}`}</p>
              </div>
          );
      }
      return null;
  };


  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" tickFormatter={(value, index) => formatYAxis(value, data[index]?.type || 'number')} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#374151'}} />
          <Bar dataKey="value" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesMetricsChart;
