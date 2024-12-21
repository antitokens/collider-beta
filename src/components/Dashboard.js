import { useEffect, useState } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { formatCount } from "../utils/colliderAlpha";

Chart.register(ChartDataLabels, ...registerables);

const Dashboard = ({
  emissionsData,
  tokensData,
  votesOverTime,
  voterDistributionData,
  totalDistributionData,
  onRefresh,
}) => {
  const [pieChartDataEmissions, setPieChartDataEmissions] = useState(null);
  const [pieChartDataTokens, setPieChartDataTokens] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [totalDistribution, setTotalDistribution] = useState(null);
  const [voterDistribution, setVoterDistribution] = useState(null);

  useEffect(() => {
    // Prepare pie chart data for voters
    setPieChartDataEmissions({
      labels: ["Baryon", "Photon"],
      datasets: [
        {
          data: [emissionsData.baryonTokens, emissionsData.photonTokens],
          backgroundColor: ["#999999", "#60A5FA"],
          borderColor: ["#000000", "#000000"],
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
              color: "#ffffffa2",
              pointStyle: "circle",
              usePointStyle: true,
              boxWidth: 9,
              boxHeight: 9,
            },
          },
          datalabels: {
            display:
              emissionsData.baryonTokens + emissionsData.photonTokens > 0,
            font: {
              family: "'SF Mono Round'",
            },
            color: (context) => {
              const datasetIndex = context.datasetIndex;
              const dataIndex = context.dataIndex;
              const colors = [["#999999", "#60A5FA"]];
              return colors[datasetIndex]?.[dataIndex] || "#ffffffcc";
            },
            backgroundColor: "000000",
            borderColor: "000000",
            borderRadius: 3,
            anchor: "center",
            formatter: (value) => {
              return `${((value / emissionsData.total) * 100).toFixed(1)}%`;
            },
          },
          tooltip: {
            bodyFont: {
              family: "'SF Mono Round'",
            },
            titleFont: {
              family: "'Space Grotesk'",
              size: 14,
            },
            callbacks: {
              label: (context) => {
                const value = context.raw;
                return ` ${((value / emissionsData.total) * 100).toFixed(
                  1
                )}% (${value
                  .toFixed(0)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")})`;
              },
            },
          },
        },
      },
    });

    // Prepare pie chart data for tokens
    setPieChartDataTokens({
      labels: ["Pro", "Anti", "Unused"],
      datasets: [
        {
          data: [
            tokensData.proTokens,
            tokensData.antiTokens,
            tokensData.total - (tokensData.proTokens + tokensData.antiTokens),
          ],
          backgroundColor: ["#00bb7a", "#c12f00", "#808080"],
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
              color: "#ffffffa2",
              pointStyle: "circle",
              usePointStyle: true,
              boxWidth: 9,
              boxHeight: 9,
            },
          },
          datalabels: {
            display: true,
            font: {
              family: "'SF Mono Round'",
            },
            color: (context) => {
              const datasetIndex = context.datasetIndex;
              const dataIndex = context.dataIndex;
              const colors = [["#00bb7a", "#c12f00", "#808080"]];
              return colors[datasetIndex]?.[dataIndex] || "#ffffffcc";
            },
            backgroundColor: "000000",
            borderColor: "000000",
            borderRadius: 3,
            anchor: "center",
            formatter: (value, context) => {
              return `${((value / tokensData.total) * 100).toFixed(1)}%`;
            },
          },
          tooltip: {
            bodyFont: {
              family: "'SF Mono Round'",
            },
            titleFont: {
              family: "'Space Grotesk'",
              size: 14,
            },
            callbacks: {
              label: (context) => {
                const value = context.raw;
                return ` ${((value / tokensData.total) * 100).toFixed(
                  1
                )}% (${value
                  .toFixed(0)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")})`;
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
          label: "Pro",
          data: Object.values(votesOverTime.tokenRangesPro),
          backgroundColor: "#00bb7a",
        },
        {
          label: "Anti",
          data: Object.values(votesOverTime.tokenRangesAnti),
          backgroundColor: "#c12f00",
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
              color: "#ffffffa2",
              pointStyle: "circle",
              usePointStyle: true,
              boxWidth: 7,
              boxHeight: 7,
            },
          },
          datalabels: {
            display: false,
          },
          tooltip: {
            bodyFont: {
              family: "'SF Mono Round'",
            },
            titleFont: {
              family: "'Space Grotesk'",
              size: 14,
            },
            callbacks: {
              label: (context) => {
                const value = context.raw;
                return ` ${value.toFixed(0)}`;
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
            grid: { color: "#d3d3d322" },
          },
          y: {
            ticks: {
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
              callback: function (value) {
                return Number.isInteger(value) ? value.toFixed(0) : ""; // Format y-axis
              },
            },
            grid: { color: "#d3d3d322" },
          },
        },
      },
    });

    // Prepare line chart data
    setLineChartData({
      labels: votesOverTime.timestamps,
      datasets: [
        {
          label: "Pro",
          data: votesOverTime.proVotes.every((value) => value === 0)
            ? []
            : votesOverTime.proVotes,
          borderColor: "#00bb7a",
          backgroundColor: "#00bb7a",
          fill: false,
        },
        {
          label: "Anti",
          data: votesOverTime.antiVotes.every((value) => value === 0)
            ? []
            : votesOverTime.antiVotes,
          borderColor: "#c12f00",
          backgroundColor: "#c12f00",
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
              color: "#ffffffa2",
              pointStyle: "circle",
              usePointStyle: true,
              boxWidth: 7,
              boxHeight: 7,
            },
          },
          datalabels: {
            display: false,
            font: {
              family: "'SF Mono Round'",
              size: 12,
            },
            color: "#ffffffee",
            anchor: "center",
            align: "end",
            formatter: (value, context) => {
              return ` ${formatCount(value)}`;
            },
          },
          tooltip: {
            bodyFont: {
              family: "'SF Mono Round'",
            },
            titleFont: {
              family: "'Space Grotesk'",
              size: 14,
            },
            callbacks: {
              label: (context) => {
                const value = context.raw;
                return ` ${value
                  .toFixed(0)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
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
            grid: { color: "#d3d3d322" },
          },
          y: {
            grid: { color: "#d3d3d322" },
            ticks: {
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
              callback: function (value) {
                return value > 1e6 ? (value * 1e-6).toFixed(0) + "m" : value; // Format y-axis
              },
            },
          },
        },
      },
    });

    setTotalDistribution({
      type: "line",
      labels: totalDistributionData
        ? totalDistributionData.range.map((value) => value.toFixed(2))
        : [],
      datasets: [
        {
          label: "Live Distribution",
          data: totalDistributionData
            ? totalDistributionData.distribution.map((item) => item.value)
            : [],
          borderColor: "#3d9bff",
          backgroundColor: "#3d9bff", // Match the legend marker color
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
              color: "#ffffffa2",
              pointStyle: "circle",
              usePointStyle: true,
              boxWidth: 7,
              boxHeight: 7,
            },
          },
          datalabels: {
            display: false,
          },
          tooltip: {
            enabled: false,
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
            grid: { color: "#d3d3d322" },
          },
          y: {
            grid: { color: "#d3d3d322" },
            ticks: {
              callback: function (value) {
                return ""; // Format y-axis
              },
            },
          },
        },
      },
    });

    setVoterDistribution({
      labels: voterDistributionData
        ? voterDistributionData.range.map((value) => value.toFixed(2))
        : [],
      datasets: [
        {
          label: "Your Distribution",
          data: voterDistributionData
            ? voterDistributionData.distribution.map((item) => item.value)
            : [],
          borderColor: "#c4c4c4",
          backgroundColor: "#c4c4c4", // Match the legend marker color
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
              color: "#ffffffa2",
              pointStyle: "circle",
              usePointStyle: true,
              boxWidth: 7,
              boxHeight: 7,
            },
          },
          datalabels: {
            display: false,
          },
          tooltip: {
            enabled: false,
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
            grid: { color: "#d3d3d322" },
          },
          y: {
            grid: { color: "#d3d3d322" },
            ticks: {
              callback: function (value) {
                return ""; // Format y-axis
              },
            },
          },
        },
      },
    });
  }, [
    emissionsData,
    tokensData,
    votesOverTime,
    voterDistributionData,
    totalDistributionData,
  ]);

  return (
    <section className="mt-20 text-gray-100">
      <div className="flex flex-row justify-between px-4 py-2 text-xl text-gray-300 text-left font-medium border border-gray-800 rounded-t-lg bg-dark-card">
        <h2 className="">Statistics</h2>
        <button
          className="text-sm text-accent-primary hover:text-gray-300"
          onClick={() => onRefresh(true)}
        >
          <div className="flex flex-row items-center text-accent-orange hover:text-white transition-colors">
            <div className="mr-1">Refresh</div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="hover:rotate-90 transition-transform duration-200 ease-in-out"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"
              />
            </svg>
          </div>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black border-x border-b border-gray-800 rounded-b-lg">
        <div className="p-4 rounded-lg">
          <div className="flex justify-center gap-2 items-center font-grotesk text-gray-200">
            <div>Token Emissions</div>
            <div className="relative group">
              <div className="cursor-pointer">
                <svg
                  className="w-4 h-4 text-gray-200"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                Displays the percentage of emitted BARYON & PHOTON tokens
              </span>
            </div>
          </div>
          {pieChartDataEmissions && (
            <Pie
              data={pieChartDataEmissions}
              options={pieChartDataEmissions.options}
            />
          )}
        </div>
        <div className="p-4 rounded-lg">
          <div className="flex justify-center gap-2 items-center font-grotesk text-gray-200">
            <div>Token Participation</div>
            <div className="relative group">
              <div className="cursor-pointer">
                <svg
                  className="w-4 h-4 text-gray-200"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                Shows the distribution of PRO & ANTI tokens in the pool, along
                with unused tokens
              </span>
            </div>
          </div>
          {pieChartDataTokens && (
            <Pie
              data={pieChartDataTokens}
              options={pieChartDataTokens.options}
            />
          )}
        </div>
        <div className="p-4 rounded-lg">
          <div className="flex justify-center gap-2 items-center font-grotesk text-gray-200">
            <div>Predicter Participation</div>
            <div className="relative group">
              <div className="cursor-pointer">
                <svg
                  className="w-4 h-4 text-gray-200"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                Highlights the contribution range of predicters based on tokens
                cast as predictions
              </span>
            </div>
          </div>
          {barChartData && (
            <Bar data={barChartData} options={barChartData.options} />
          )}
        </div>
        <div className="p-4 rounded-lg">
          <div className="flex justify-center gap-2 items-center font-grotesk text-gray-200">
            <div>Tokens Over Time</div>
            <div className="relative group">
              <div className="cursor-pointer">
                <svg
                  className="w-4 h-4 text-gray-200"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                Tracks the number of PRO and ANTI tokens cast as predictions
                over time
              </span>
            </div>
          </div>
          {lineChartData && (
            <Line data={lineChartData} options={lineChartData.options} />
          )}
        </div>
        <div className="p-4 rounded-lg">
          <div className="flex justify-center gap-2 items-center font-grotesk text-gray-200">
            <div>Global Prediction</div>
            <div className="relative group">
              <div className="cursor-pointer">
                <svg
                  className="w-4 h-4 text-gray-200"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                Represents the distribution of the current state
              </span>
            </div>
          </div>
          {totalDistribution && (
            <Line
              data={totalDistribution}
              options={totalDistribution.options}
            />
          )}
        </div>
        <div className="p-4 rounded-lg">
          <div className="flex justify-center gap-2 items-center font-grotesk text-gray-200">
            <div>Your Prediction</div>
            <div className="relative group">
              <div className="cursor-pointer">
                <svg
                  className="w-4 h-4 text-gray-200"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                Represents the distribution of your prediction
              </span>
            </div>
          </div>
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
