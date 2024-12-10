import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Pie, Bar, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const Dashboard = ({ votersData, tokensData, votesOverTime }) => {
  const [pieChartDataVoters, setPieChartDataVoters] = useState(null);
  const [pieChartDataTokens, setPieChartDataTokens] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [tokenDistribution, setTokenDistribution] = useState(null);
  const [voterDistribution, setVoterDistribution] = useState(null);

  useEffect(() => {
    // Prepare pie chart data for voters
    setPieChartDataVoters({
      labels: ["PRO", "ANTI", "UNCAST"],
      datasets: [
        {
          data: [
            votersData.proVoters,
            votersData.antiVoters,
            votersData.total - (votersData.proVoters + votersData.antiVoters),
          ],
          backgroundColor: ["#00CC8E", "#D13800", "#808080"],
          borderColor: ["#000000", "#000000", "#000000"],
        },
      ],
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              font: {
                family: "'SF Mono Round'",
              },
            },
          },
        },
      },
    });

    // Prepare pie chart data for tokens
    setPieChartDataTokens({
      labels: ["PRO", "ANTI", "UNUSED"],
      datasets: [
        {
          data: [
            tokensData.proTokens,
            tokensData.antiTokens,
            tokensData.total - (tokensData.proTokens + tokensData.antiTokens),
          ],
          backgroundColor: ["#00CC8E", "#D13800", "#808080"],
          borderColor: ["#000000", "#000000", "#000000"],
        },
      ],
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              font: {
                family: "'SF Mono Round'",
              },
            },
          },
        },
      },
    });

    // Prepare bar chart data
    setBarChartData({
      labels: Object.keys(votesOverTime.tokenRangesPro),
      datasets: [
        {
          label: "PRO",
          data: Object.values(votesOverTime.tokenRangesPro),
          backgroundColor: "#00CC8E",
        },
        {
          label: "ANTI",
          data: Object.values(votesOverTime.tokenRangesAnti),
          backgroundColor: "#D13800",
        },
      ],
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              font: {
                family: "'SF Mono Round'",
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
            },
            grid: { color: "#D3D3D322" },
          },
          y: {
            ticks: {
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
            },
            grid: { color: "#D3D3D322" },
          },
        },
      },
    });

    // Prepare line chart data
    setLineChartData({
      labels: votesOverTime.timestamps,
      datasets: [
        {
          label: "PRO",
          data: votesOverTime.proVotes,
          borderColor: "#00CC8E",
          backgroundColor: "#00CC8E",
          fill: false,
        },
        {
          label: "ANTI",
          data: votesOverTime.antiVotes,
          borderColor: "#D13800",
          backgroundColor: "#D13800",
          fill: false,
        },
      ],
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              font: {
                family: "'SF Mono Round'",
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
            },
            grid: { color: "#D3D3D322" },
          },
          y: {
            grid: { color: "#D3D3D322" },
            ticks: {
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
              callback: function (value) {
                return (value * 1e-6).toFixed(0) + "M"; // Format y-axis
              },
            },
          },
        },
      },
    });

    // Normal distribution calculator
    const calculateNormalDistribution = (range, mean, variance) => {
      const distribution = [];
      for (let x of range) {
        const value =
          Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(variance, 2))) /
          (Math.sqrt(2 * Math.PI) * variance);
        distribution.push(value);
      }
      return distribution;
    };

    // Prepare token-based normal distribution
    const tokensMean = (tokensData.proTokens + tokensData.antiTokens) / 2;
    const tokensVariance =
      Math.abs(tokensData.proTokens - tokensData.antiTokens) / 2 || 1;
    const tokensStdDev = Math.sqrt(tokensVariance); // Standard deviation

    // Define range: [mean - 5 * stdDev, mean + 5 * stdDev], divided into 100 points
    const rangeTokens = Array.from(
      { length: 100 },
      (_, i) =>
        tokensMean - 20000 * tokensStdDev + (i / 99) * 40000 * tokensStdDev
    );
    const tokensDistData = calculateNormalDistribution(
      rangeTokens,
      tokensMean,
      tokensVariance
    );

    setTokenDistribution({
      type: "line",
      labels: rangeTokens.map((value) => (value / 1e6).toFixed(0) + "M"),
      datasets: [
        {
          label: "Token Distribution",
          data: tokensDistData,
          borderColor: "#FF9500",
          backgroundColor: "#FF9500", // Match the legend marker color
          pointStyle: "line",
        },
      ],
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              font: {
                family: "'SF Mono Round'",
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
            },
            grid: { color: "#D3D3D322" },
          },
          y: {
            grid: { color: "#D3D3D322" },
            ticks: {
              callback: function (value) {
                return ""; // Format y-axis
              },
            },
          },
        },
      },
    });

    const voterMean = (votersData.proVoters + votersData.antiVoters) / 2;
    const voterVariance =
      Math.abs(votersData.proVoters - votersData.antiVoters) / 2 || 1; // Avoid divide by zero
    const voterStdDev = Math.sqrt(voterVariance); // Standard deviation

    // Define range: [mean - 5 * stdDev, mean + 5 * stdDev], divided into 100 points
    const rangeVoters = Array.from(
      { length: 100 },
      (_, i) => voterMean - 100 * voterStdDev + (i / 99) * 200 * voterStdDev
    );
    const voterDistData = calculateNormalDistribution(
      rangeVoters,
      voterMean,
      voterVariance
    );

    setVoterDistribution({
      labels: rangeVoters.map((value) => (value / 1e3).toFixed(1) + "K"),
      datasets: [
        {
          label: "Voter Distribution",
          data: voterDistData,
          borderColor: "#FF9500",
          backgroundColor: "#FF9500", // Match the legend marker color
          pointStyle: "line",
        },
      ],
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              font: {
                family: "'SF Mono Round'",
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
            },
            grid: { color: "#D3D3D322" },
          },
          y: {
            grid: { color: "#D3D3D322" },
            ticks: {
              callback: function (value) {
                return ""; // Format y-axis
              },
            },
          },
        },
      },
    });
  }, [votersData, tokensData, votesOverTime]);

  return (
    <section className="py-12 text-gray-100">
      <h2 className="text-center text-2xl font-bold mb-6">Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <div className="p-4 rounded-lg">
          <h3 className="text-center font-semibold mb-4">Voter Distribution</h3>
          {pieChartDataVoters && <Pie data={pieChartDataVoters} options={pieChartDataVoters.options} />}
        </div>
        <div className="p-4 rounded-lg">
          <h3 className="text-center font-semibold mb-4">Token Distribution</h3>
          {pieChartDataTokens && <Pie data={pieChartDataTokens} options={pieChartDataTokens.options} />}
        </div>
        <div className="p-4 rounded-lg">
          <h3 className="text-center font-semibold mb-4">
            Voter Contributions
          </h3>
          {barChartData && (
            <Bar data={barChartData} options={barChartData.options} />
          )}
        </div>
        <div className="p-4 rounded-lg">
          <h3 className="text-center font-semibold mb-4">Votes Over Time</h3>
          {lineChartData && (
            <Line data={lineChartData} options={lineChartData.options} />
          )}
        </div>
        <div className="p-4 rounded-lg">
          <h3 className="text-center font-semibold mb-4">
            Normalised Token Distribution
          </h3>
          {tokenDistribution && (
            <Line
              data={tokenDistribution}
              options={tokenDistribution.options}
            />
          )}
        </div>
        <div className="p-4 rounded-lg">
          <h3 className="text-center font-semibold mb-4">
            Normalised Voter Distribution
          </h3>
          {voterDistribution && (
            <Line
              data={voterDistribution}
              options={voterDistribution.options}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
