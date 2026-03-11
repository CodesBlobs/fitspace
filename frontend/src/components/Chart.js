'use client';

// ─── Chart Component ────────────────────────────────────────
// Chart.js wrapper for weekly trends (bar/line charts in pastel colors)

import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const pastelColors = {
  lavender: { bg: 'rgba(167, 139, 250, 0.3)', border: '#a78bfa' },
  mint: { bg: 'rgba(104, 212, 160, 0.3)', border: '#68d4a0' },
  peach: { bg: 'rgba(249, 168, 112, 0.3)', border: '#f9a870' },
  sky: { bg: 'rgba(96, 181, 246, 0.3)', border: '#60b5f6' },
  rose: { bg: 'rgba(251, 113, 133, 0.3)', border: '#fb7185' },
};

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#1e1b2e',
      titleColor: '#fff',
      bodyColor: '#d4c5f9',
      cornerRadius: 12,
      padding: 12,
      titleFont: { weight: '600' },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#9ca3af', font: { size: 11 } },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(229, 231, 235, 0.5)' },
      ticks: { color: '#9ca3af', font: { size: 11 } },
      border: { display: false },
    },
  },
};

export function BarChart({ labels, data, label = '', color = 'lavender', height = 220 }) {
  const c = pastelColors[color] || pastelColors.lavender;

  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: c.bg,
        borderColor: c.border,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={defaultOptions} />
    </div>
  );
}

export function LineChart({ labels, data, label = '', color = 'lavender', height = 220 }) {
  const c = pastelColors[color] || pastelColors.lavender;

  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        fill: true,
        backgroundColor: c.bg,
        borderColor: c.border,
        borderWidth: 2,
        pointBackgroundColor: c.border,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
      },
    ],
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={defaultOptions} />
    </div>
  );
}
