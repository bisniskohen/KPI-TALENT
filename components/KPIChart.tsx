
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface KPIChartProps {
  data: { name: string; totalSales: number }[];
}

const KPIChart: React.FC<KPIChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
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
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `Rp${(Number(value)/1000)}k`} />
          <Tooltip formatter={(value) => [`Rp${Number(value).toLocaleString('id-ID')}`, "Total Sales"]} />
          <Legend />
          <Bar dataKey="totalSales" fill="#4f46e5" name="Total Sales (Rp)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KPIChart;
