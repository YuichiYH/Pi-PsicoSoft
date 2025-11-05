import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function PieChart({ data }) {
    const formattedData = Object.entries(data).map(([name, value]) => ({
        name,
        value
    }));

    return (
        <ResponsiveContainer width="100%" height={100}>
            <RechartsPieChart>
                <Pie
                    data={formattedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {formattedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
            </RechartsPieChart>
        </ResponsiveContainer>
    );
}

export default PieChart;