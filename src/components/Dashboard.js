import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Pie, Bar, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { color, sign } from "chart.js/helpers";

Chart.register(ChartDataLabels, ...registerables);

const Dashboard = ({
  votersData,
  tokensData,
  votesOverTime,
  voterDistribution,
  totalDistribution,
}) => {
  const [pieChartDataVoters, setPieChartDataVoters] = useState(null);
  const [pieChartDataTokens, setPieChartDataTokens] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [finalDistribution, setFinalDistribution] = useState(null);
  const [userDistribution, setUserDistribution] = useState(null);

  useEffect(() => {
    // Prepare pie chart data for voters
    setPieChartDataVoters({
      labels: ["Pro", "Anti", "Uncast"],
      datasets: [
        {
          data: [
            votersData.proVoters,
            votersData.antiVoters,
            votersData.total - (votersData.proVoters + votersData.antiVoters),
          ],
          backgroundColor: ["#00BB7A", "#C12F00", "#808080"],
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
              color: "#FFFFFFA2",
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
              const colors = [["#00BB7A", "#C12F00", "#808080"]];
              return colors[datasetIndex]?.[dataIndex] || "#ffffffcc";
            },
            backgroundColor: "000000",
            borderColor: "000000",
            borderRadius: 3,
            anchor: "center",
            formatter: (value) => {
              return `${((value / votersData.total) * 100).toFixed(1)}%`;
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
                return ` ${((value / votersData.total) * 100).toFixed(
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
          backgroundColor: ["#00BB7A", "#C12F00", "#808080"],
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
              color: "#FFFFFFA2",
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
              const colors = [["#00BB7A", "#C12F00", "#808080"]];
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
                return ` ${((value / votersData.total) * 100).toFixed(
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
          backgroundColor: "#00BB7A",
        },
        {
          label: "Anti",
          data: Object.values(votesOverTime.tokenRangesAnti),
          backgroundColor: "#C12F00",
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
              color: "#FFFFFFA2",
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
                return ` ${value}`;
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
          label: "Pro",
          data: votesOverTime.proVotes,
          borderColor: "#00BB7A",
          backgroundColor: "#00BB7A",
          fill: false,
        },
        {
          label: "Anti",
          data: votesOverTime.antiVotes,
          borderColor: "#C12F00",
          backgroundColor: "#C12F00",
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
              color: "#FFFFFFA2",
            },
          },
          datalabels: {
            display: false,
            font: {
              family: "'SF Mono Round'",
              size: 12,
            },
            color: "#FFFFFee",
            anchor: "center",
            align: "end",
            formatter: (value, context) => {
              return ` ${
                value >= 1e6
                  ? (value / 1e6).toFixed(1).replace(/\.0$/, "") + "m"
                  : value >= 1e3
                  ? (value / 1e3).toFixed(0).replace(/\.0$/, "") + "k"
                  : value.toString()
              }`;
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

    setFinalDistribution({
      type: "line",
      labels: totalDistribution.range.map((value) => value.toFixed(2)),
      datasets: [
        {
          label: "Outcome Distribution",
          data: totalDistribution.distribution.map((item) => item.value),
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
              color: "#FFFFFFA2",
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

    setUserDistribution({
      labels: voterDistribution.range.map((value) => value.toFixed(2)),
      datasets: [
        {
          label: "Your Distribution",
          data: voterDistribution.distribution.map((item) => item.value),
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
              color: "#FFFFFFA2",
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
  }, [
    votersData,
    tokensData,
    votesOverTime,
    voterDistribution,
    totalDistribution,
  ]);

  return (
    <section className="mt-20 text-gray-100">
      <h2 className="px-4 py-2 text-xl text-gray-300 text-left font-medium border border-gray-800 rounded-t-lg bg-dark-card">
        Statistics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black border-x border-b border-gray-800 rounded-b-lg">
        <div className="p-4 rounded-lg">
          <div className="flex justify-center gap-2 items-center font-grotesk text-gray-200">
            <div>Voter Participation</div>
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
                Displays the percentage of votes cast as PRO & ANTI tokens,
                along with uncast votes.
              </span>
            </div>
          </div>
          {pieChartDataVoters && (
            <Pie
              data={pieChartDataVoters}
              options={pieChartDataVoters.options}
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
                with unused tokens.
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
            <div>Voter Participation</div>
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
                Highlights the contribution range of voters based on tokens cast
                as votes.
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
                Tracks the number of PRO and ANTI tokens cast as votes over
                time.
              </span>
            </div>
          </div>
          {lineChartData && (
            <Line data={lineChartData} options={lineChartData.options} />
          )}
        </div>
        <div className="p-4 rounded-lg">
          <div className="flex justify-center gap-2 items-center font-grotesk text-gray-200">
            <div>Outcome Distribution</div>
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
                Represents the distribution of the current state.
              </span>
            </div>
          </div>
          {finalDistribution && (
            <Line
              data={finalDistribution}
              options={finalDistribution.options}
            />
          )}
        </div>
        <div className="p-4 rounded-lg">
          <div className="flex justify-center gap-2 items-center font-grotesk text-gray-200">
            <div>Your Distribution</div>
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
                Represents the distribution of your vote.
              </span>
            </div>
          </div>
          {userDistribution && (
            <Line data={userDistribution} options={userDistribution.options} />
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
