import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Pie, Bar, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { color } from "chart.js/helpers";

Chart.register(...registerables);

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
              color: "#FFFFFFA2",
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
              color: "#FFFFFFA2",
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
          backgroundColor: "#00CC8E",
        },
        {
          label: "Anti",
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
              color: "#FFFFFFA2",
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
          borderColor: "#00CC8E",
          backgroundColor: "#00CC8E",
          fill: false,
        },
        {
          label: "Anti",
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
              color: "#FFFFFFA2",
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
    <section className="py-12 text-gray-100">
      <h2 className="text-center text-2xl font-bold mb-6">Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <div className="p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-center font-semibold">Voter Participation</h3>
            <button
              className="text-gray-300 hover:text-white"
              onClick={() =>
                alert(
                  "Displays the percentage of votes cast for PRO and ANTI tokens, along with uncast votes."
                )
              }
              title="Displays the percentage of votes cast for PRO and ANTI tokens, along with uncast votes."
            >
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="#ffffff66"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </button>
          </div>
          {pieChartDataVoters && (
            <Pie
              data={pieChartDataVoters}
              options={pieChartDataVoters.options}
            />
          )}
        </div>
        <div className="p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-center font-semibold">Token Participation</h3>
            <button
              className="text-gray-300 hover:text-white"
              onClick={() =>
                alert(
                  "Shows the distribution of PRO and ANTI tokens in the system, along with unused tokens."
                )
              }
              title="Shows the distribution of PRO and ANTI tokens in the system, along with unused tokens."
            >
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="#ffffff66"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </button>
          </div>
          {pieChartDataTokens && (
            <Pie
              data={pieChartDataTokens}
              options={pieChartDataTokens.options}
            />
          )}
        </div>
        <div className="p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-center font-semibold">Voter Contributions</h3>
            <button
              className="text-gray-300 hover:text-white"
              onClick={() =>
                alert(
                  "Highlights the contribution range of voters based on token counts."
                )
              }
              title="Highlights the contribution range of voters based on token counts."
            >
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="#ffffff66"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </button>
          </div>
          {barChartData && (
            <Bar data={barChartData} options={barChartData.options} />
          )}
        </div>
        <div className="p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-center font-semibold">Votes Over Time</h3>
            <button
              className="text-gray-300 hover:text-white"
              onClick={() =>
                alert(
                  "Tracks the number of votes for PRO and ANTI tokens over time."
                )
              }
              title="Tracks the number of votes for PRO and ANTI tokens over time."
            >
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="#ffffff66"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </button>
          </div>
          {lineChartData && (
            <Line data={lineChartData} options={lineChartData.options} />
          )}
        </div>
        <div className="p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-center font-semibold">Outcome Distribution</h3>
            <button
              className="text-gray-300 hover:text-white"
              onClick={() =>
                alert("Represents the distribution of the final outcome.")
              }
              title="Represents the distribution of the final outcome."
            >
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="#ffffff66"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </button>
          </div>
          {finalDistribution && (
            <Line
              data={finalDistribution}
              options={finalDistribution.options}
            />
          )}
        </div>
        <div className="p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-center font-semibold">Your Distribution</h3>
            <button
              className="text-gray-300 hover:text-white"
              onClick={() => alert("Represents the distribution of your vote.")}
              title="Represents the distribution of your vote."
            >
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="#ffffff66"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </button>
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
