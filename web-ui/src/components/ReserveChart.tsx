// "use client";

// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import { Line } from "react-chartjs-2";
// import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
// import { usePool } from "@/src/context/PoolContext";
// import useEthereum from "@/src/hooks/useEthereum";
// import { PAIR_ABI } from "@/src/abis/pair";

// ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

// export default function ReserveChart() {
//   const { signer } = useEthereum();
//   const { selectedPool } = usePool();
//   const [dataPoints, setDataPoints] = useState<{ x: number; y: number }[]>([]);

//   useEffect(() => {
//     if (!signer || !selectedPool) return;

//     const pair = new ethers.Contract(selectedPool.pairAddress, PAIR_ABI, signer);

//     const fetchReserves = async () => {
//       try {
//         const [reserve0, reserve1] = await pair.getReserves().then((r) => [r[0], r[1]]);
//         const x = Number(ethers.formatUnits(reserve0));
//         const y = Number(ethers.formatUnits(reserve1));
//         setDataPoints((prev) => [...prev, { x, y }].slice(-50)); // last 50 points
//       } catch (err) {
//         console.error("Error fetching reserves", err);
//       }
//     };

//     fetchReserves();
//     const interval = setInterval(fetchReserves, 10000); // every 10 sec
//     return () => clearInterval(interval);
//   }, [signer, selectedPool]);

//   const chartData = {
//     datasets: [
//       {
//         label: "Reserve Curve",
//         data: dataPoints,
//         borderColor: "rgb(75, 192, 192)",
//         tension: 0.2,
//       },
//     ],
//   };

//   const options = {
//     scales: {
//       x: { title: { display: true, text: "Reserve 0" } },
//       y: { title: { display: true, text: "Reserve 1" } },
//     },
//   };

//   if (!selectedPool) return <div className="text-gray-500">Select a pool to view reserve chart.</div>;

//   return (
//     <div className="bg-white p-4 rounded shadow">
//       <h2 className="text-lg font-semibold mb-4">📉 Live Pool Reserve Curve</h2>
//       <Line data={chartData} options={options} />
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Line, Scatter } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  LineElement, 
  CategoryScale, 
  LinearScale, 
  PointElement,
  ScatterController,
  Title,
  Tooltip,
  Legend 
} from "chart.js";
import { usePool } from "@/src/context/PoolContext";
import useEthereum from "@/src/hooks/useEthereum";
import { PAIR_ABI } from "@/src/abis/pair";

// Register all required Chart.js components
ChartJS.register(
  LineElement, 
  CategoryScale, 
  LinearScale, 
  PointElement,
  ScatterController,
  Title,
  Tooltip,
  Legend
);

export default function ReserveChart() {
  const { signer } = useEthereum();
  const { selectedPool } = usePool();
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [constantProduct, setConstantProduct] = useState<number>(0);
  const [curvePoints, setCurvePoints] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (!signer || !selectedPool) {
      setCurrentPoint(null);
      setCurvePoints([]);
      setConstantProduct(0);
      return;
    }

    const fetchReservesAndGenerateCurve = async () => {
      try {
        const pair = new ethers.Contract(selectedPool.pairAddress, PAIR_ABI, signer);
        const [reserve0, reserve1] = await pair.getReserves().then((r) => [r[0], r[1]]);
        
        // Convert reserves to more manageable numbers
        const x = Number(ethers.formatUnits(reserve0));
        const y = Number(ethers.formatUnits(reserve1));
        
        // Set current point (where AMM is currently at)
        setCurrentPoint({ x, y });
        
        // Calculate k (constant product)
        const k = x * y;
        setConstantProduct(k);
        
        // Generate points for the constant product curve (x * y = k)
        generateCurvePoints(k, x);
      } catch (err) {
        console.error("Error fetching reserves", err);
      }
    };

    // Generate points along the curve
    const generateCurvePoints = (k: number, currentX: number) => {
      // If k is too close to zero, use a minimum value
      if (k < 0.0001) {
        k = 0.0001;
      }
      
      const points: { x: number; y: number }[] = [];
      
      // Generate points from 0.1x to 2x of current position
      const minX = Math.max(0.1 * currentX, 0.001);
      const maxX = 2 * currentX;
      
      // Generate more points for smoother curve
      for (let i = 0; i <= 100; i++) {
        // Use logarithmic scale for better distribution of points
        const xValue = minX * Math.pow(maxX / minX, i / 100);
        const yValue = k / xValue; // y = k/x formula
        
        points.push({
          x: xValue,
          y: yValue
        });
      }
      
      setCurvePoints(points);
    };

    fetchReservesAndGenerateCurve();
    
    // Setup interval to update the chart
    const interval = setInterval(fetchReservesAndGenerateCurve, 10000);
    return () => clearInterval(interval);
  }, [signer, selectedPool]);

  // Prepare data for the chart
  const chartData = {
    datasets: [
      // The constant product curve
      {
        type: 'line' as const,
        label: 'Constant Product Curve (x * y = k)',
        data: curvePoints,
        borderColor: 'rgb(75, 192, 192)',
        pointRadius: 0, // Hide individual points
        borderWidth: 2,
        fill: false,
        tension: 0,
      },
      // Current point (where AMM is currently at)
      {
        type: 'scatter' as const,
        label: 'Current Position (P)',
        data: currentPoint ? [currentPoint] : [],
        backgroundColor: 'rgb(255, 99, 132)',
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Reserve 0',
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        ticks: {
          callback: function(value: any) {
            // Format numbers to be more readable
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'k';
            }
            return value;
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Reserve 1',
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        ticks: {
          callback: function(value: any) {
            // Format numbers to be more readable
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'k';
            }
            return value;
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const point = context.raw;
            return `Reserve 0: ${point.x.toFixed(4)}, Reserve 1: ${point.y.toFixed(4)}`;
          },
          footer: function(tooltipItems: any) {
            if (tooltipItems[0].datasetIndex === 1) { // Only for current position
              return `Constant k: ${constantProduct.toFixed(4)}`;
            }
            return '';
          }
        }
      },
      legend: {
        display: true,
        position: 'top' as const
      },
      title: {
        display: false,
        text: 'Reserve Curve'
      }
    }
  };

  if (!selectedPool) {
    return (
      <div className="bg-white p-6 rounded shadow text-center">
        <h2 className="text-lg font-semibold mb-4">📉 Pool Reserve Curve</h2>
        <p className="text-gray-500">Select a pool to view the reserve curve.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">📉 Pool Reserve Curve</h2>
      <div className="w-full h-80">
        <Scatter data={chartData} options={options} />
      </div>
      {currentPoint && (
        <div className="mt-4 text-sm text-gray-700">
          <p><strong>Current Position (P):</strong> Reserve 0: {currentPoint.x.toFixed(4)}, Reserve 1: {currentPoint.y.toFixed(4)}</p>
          <p><strong>Constant Product (k):</strong> {constantProduct.toFixed(4)}</p>
          <p className="mt-2 text-xs text-gray-500">The curve represents the constant product formula: x * y = k, where k = {constantProduct.toFixed(4)}</p>
        </div>
      )}
    </div>
  );
}