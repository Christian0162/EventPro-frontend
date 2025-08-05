// Charts.js
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    BarElement,
    ArcElement,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";

import { Line, Pie, Bar } from "react-chartjs-2";

ChartJS.register(
    LineElement,
    CategoryScale,
    BarElement,
    ArcElement,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Title
);

export const LineChart = () => {
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [
            {
                label: 'Avg. Rating',
                data: [5, 4, 2, 3, 5],
                fill: false,
                borderColor: 'rgb(143, 67, 210)',
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' },
        },
    };

    return (
        <div className="w-full h-full justify-center items-center flex">
            <Line data={data} options={options} />
        </div>
    );
};

export const PieChart = ({ className }) => {
    const data = {
        labels: ["Approved", "Pending", "Rejected"],
        datasets: [
            {
                label: "Shops Status",
                data: [10, 5, 3],
                backgroundColor: ["#4ade80", "#facc15", "#f87171"],
                borderColor: ["#22c55e", "#eab308", "#ef4444"],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "bottom" },
            title: { display: true, text: "Shop Approval Status" },
        },
    };

    return (
        <div className={`${className}`}>
            <Pie data={data} options={options} />
        </div>
    );
};

export const BarChart = ({ className }) => {
    const data = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        datasets: [
            {
                label: "Approved Shops",
                data: [3, 6, 4, 5, 2,],
                backgroundColor: "#60a5fa",
                borderRadius: 5,
            },
            {
                label: "Rejected Shops",
                data: [1, 2, 3, 2, 1],
                backgroundColor: "#f87171", // Red-400
                borderRadius: 5,
            },
            {
                label: "Rejected Shops",
                data: [1, 2, 3, 4, 5],
                backgroundColor: "#61289b", // Red-400
                borderRadius: 5,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Approved Shops This Week" },
            font: { size: 18, weight: 'bold' },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Shops',
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Day of the Week',
                }
            }
        }
    };

    return (
        <div className={`${className}`}>
            <Bar data={data} options={options} />
        </div>
    );
};
