import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function TimeLineChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={100}>
            <LineChart data={data}>
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default TimeLineChart;