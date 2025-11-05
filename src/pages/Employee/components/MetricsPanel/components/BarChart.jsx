import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function BarChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={100}>
            <RechartsBarChart data={data}>
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
            </RechartsBarChart>
        </ResponsiveContainer>
    );
}

export default BarChart;