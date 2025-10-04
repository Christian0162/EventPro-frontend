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

ChartJS.defaults.animation = false;

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

export const PieChart = ({
    className,
    labels = [],
    dataValues = [],
    backgroundColors = [],
    borderColors = [],
    title = "",
    options: customOptions = {}
}) => {

    const data = {
        labels,
        datasets: [
            {
                label: title,
                data: dataValues,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "bottom" },
            title: { display: !!title, text: title },
        },
        ...customOptions,
    };

    return (
        <div className={className}>
            <Pie data={data} options={options} />
        </div>
    );
};

export const BarChart = ({ className, labels = [], datasets = [], title = "", xLabel = "", yLabel = "", options: customOptions = {} }) => {

    const data = {
        labels,
        datasets,
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: !!title, text: title },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: !!yLabel, text: yLabel },
            },
            x: {
                title: { display: !!xLabel, text: xLabel },
            },
        },
        ...customOptions,
    };

    return (
        <div className={className}>
            <Bar data={data} options={options} />
        </div>
    );
};

