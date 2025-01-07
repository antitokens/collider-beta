import { useEffect, useState } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  formatCount,
  truncateMiddle,
  generateGradientColor,
  shortenTick,
  detectBinningStrategy,
} from "../utils/utils";

Chart.register(ChartDataLabels, ...registerables);

/* Inverter Dashboard */

const DashboardInverter = ({
  emissionsData,
  collisionsData,
  eventsOverTime,
  colliderDistribution = null,
  totalDistribution = null,
  onRefresh,
  connected = false,
  dynamics = [],
  holders = [],
  isMobile = false,
  schedule = [],
}) => {
  const [pieChartDataEmissions, setPieChartDataEmissions] = useState(null);
  const [pieChartDataTokens, setPieChartDataTokens] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [netDistribution, setNetDistribution] = useState(null);
  const [winnerDistribution, setWinnerDistribution] = useState(null);

  const xAxisLabelPlugin = {
    id: "xAxisLabel",
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const xAxis = chart.scales.x;
      // Style settings for the label
      ctx.font = "8px 'SF Mono Round'";
      ctx.fillStyle = "#666666";
      ctx.textBaseline = "middle";
      // Position calculation
      // This puts the label near the end of x-axis, slightly above it
      const x = xAxis.right - 15; // Shift left from the end
      const y = xAxis.top + 7.5; // Shift up from the axis
      // Draw the label
      ctx.fillText("UTC", x, y);
    },
  };

  useEffect(() => {
    // Prepare pie chart data for events
    setPieChartDataEmissions({
      labels: ["Photon", "Baryon"],
      datasets: [
        {
          data: [emissionsData.photonTokens, emissionsData.baryonTokens],
          backgroundColor: ["rgb(123, 191, 255)", "rgb(58, 183, 192)"],
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
      labels: ["Pro", "Anti"],
      datasets: [
        {
          data: [collisionsData.proTokens, collisionsData.antiTokens],
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
            display: collisionsData.antiTokens + collisionsData.proTokens > 0,
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
              return `${(
                (value /
                  (collisionsData.antiTokens + collisionsData.proTokens)) *
                100
              ).toFixed(1)}%`;
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
                return ` ${(
                  (value /
                    (collisionsData.antiTokens + collisionsData.proTokens)) *
                  100
                ).toFixed(1)}% (${value
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
      labels: Object.keys(eventsOverTime.ranges.pro), // x-axis labels are common
      datasets: [
        {
          label: "Pro",
          data: Object.values(eventsOverTime.ranges.pro),
          backgroundColor: "#00bb7a",
        },
        {
          label: "Anti",
          data: Object.values(eventsOverTime.ranges.anti),
          backgroundColor: "#c12f00",
        },
        {
          label: "Photon",
          data: Object.values(eventsOverTime.ranges.photon),
          backgroundColor: "rgb(123, 191, 255)",
        },
        {
          label: "Baryon",
          data: Object.values(eventsOverTime.ranges.baryon),
          backgroundColor: "rgb(58, 182, 193)",
        },
      ],
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
                return eventsOverTime.events.baryon.every(
                  (value) => value === 0
                ) &&
                  eventsOverTime.events.photon.every((value) => value === 0) &&
                  eventsOverTime.events.anti.every((value) => value === 0) &&
                  eventsOverTime.events.pro.every((value) => value === 0)
                  ? ""
                  : Number.isInteger(value)
                  ? value.toFixed(0)
                  : ""; // Format y-axis
              },
            },
            grid: { color: "#d3d3d322" },
          },
        },
      },
    });

    // Prepare line chart data
    const useBinning = detectBinningStrategy(schedule);
    setLineChartData({
      labels: eventsOverTime.timestamps.map((value) =>
        shortenTick(value, useBinning)
      ),
      datasets: [
        {
          label: "Pro",
          data: eventsOverTime.events.pro.every((value) => value === 0)
            ? []
            : eventsOverTime.events.pro,
          borderColor: "#00bb7a",
          backgroundColor: "#00bb7a",
          fill: false,
          tension: 0.25,
        },
        {
          label: "Anti",
          data: eventsOverTime.events.anti.every((value) => value === 0)
            ? []
            : eventsOverTime.events.anti,
          borderColor: "#c12f00",
          backgroundColor: "#c12f00",
          fill: false,
          tension: 0.25,
        },
        {
          label: "Photon",
          data: eventsOverTime.events.photon.every((value) => value === 0)
            ? []
            : eventsOverTime.events.photon,
          borderColor: "rgb(123, 191, 255)",
          backgroundColor: "rgb(123, 191, 255)",
          fill: false,
          tension: 0.25,
        },
        {
          label: "Baryon",
          data: eventsOverTime.events.baryon.every((value) => value === 0)
            ? []
            : eventsOverTime.events.baryon,
          borderColor: "rgb(58, 182, 193)",
          backgroundColor: "rgb(58, 182, 193)",
          fill: false,
          tension: 0.25,
        },
      ],
      plugins: [xAxisLabelPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
              return ` ${formatCount(value, true)}`;
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
              minRotation: 0,
              maxRotation: 0,
            },
            grid: { color: "#d3d3d322" },
          },
          y: {
            type: "logarithmic",
            grid: { color: "#d3d3d322" },
            ticks: {
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
              callback: function (value) {
                return eventsOverTime.events.baryon.every(
                  (value) => value === 0
                ) &&
                  eventsOverTime.events.photon.every((value) => value === 0) &&
                  eventsOverTime.events.anti.every((value) => value === 0) &&
                  eventsOverTime.events.pro.every((value) => value === 0)
                  ? ""
                  : formatCount(value, true);
              },
            },
          },
        },
      },
    });

    setNetDistribution({
      type: "line",
      labels: totalDistribution
        ? totalDistribution.short.map((value) =>
            value > 0 ? formatCount(value, false) : ""
          )
        : []
        ? colliderDistribution.short.map((value) =>
            value > 0 ? formatCount(value, false) : ""
          )
        : [],
      datasets: [
        {
          label: "Live",
          data: totalDistribution
            ? totalDistribution.curve.map((item) => item.value)
            : [],
          borderColor: "#3d9bff",
          backgroundColor: "#3d9bff",
          pointStyle: "line",
        },
        {
          label: "Yours",
          data: connected
            ? colliderDistribution
              ? colliderDistribution.curve.map((item) => item.value)
              : []
            : [],
          borderColor: "#c4c4c4",
          backgroundColor: "#c4c4c4",
          pointStyle: "line",
        },
      ],
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
            display: connected,
            ticks: {
              maxTicksLimit: 10,
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
            },
            grid: { color: "#d3d3d322" },
          },
          x2: {
            position: connected ? "top" : "bottom",
            ticks: {
              callback: function (value, index) {
                // Map index to a new labels array for the second axis
                return totalDistribution.short[index]
                  ? formatCount(totalDistribution.short[index], false)
                  : null;
              },
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
              color: "#3d9bff",
            },
            grid: {
              color: "#d3d3d322",
            },
          },
          y: {
            grid: { color: "#d3d3d322" },
            ticks: {
              callback: function (value) {
                return totalDistribution.u || colliderDistribution.u
                  ? value.toFixed(1)
                  : "";
              },
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
            },
          },
          y2: {
            position: "right",
            grid: { color: "#d3d3d322" },
            ticks: {
              callback: function (value) {
                return totalDistribution.u || colliderDistribution.u
                  ? value.toFixed(1)
                  : "";
              },
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
            },
          },
        },
      },
    });

    const winnerRanks = dynamics.map(
      (value, index, arr) => arr.filter((v) => v > value).length + 1
    );
    setWinnerDistribution({
      labels: winnerRanks,
      datasets: [
        {
          label: "Ranking Metric",
          data: dynamics,
          borderColor: dynamics
            .map((value) =>
              generateGradientColor(
                value,
                Math.min(...dynamics),
                Math.max(...dynamics),
                [255, 51, 0, 1],
                [0, 219, 84, 1]
              )
            )
            .map((color) =>
              color.replace(/rgba\((.+), (\d+\.\d+)\)/, "rgba($1, 1)")
            ),
          backgroundColor: dynamics.map((value) =>
            generateGradientColor(
              value,
              Math.min(...dynamics),
              Math.max(...dynamics),
              [255, 51, 0, 1],
              [0, 219, 84, 1]
            )
          ),
          pointStyle: "line",
        },
      ],
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
              family: "'SF Mono Round'",
              size: 14,
            },
            callbacks: {
              title: (context) => {
                const dataIndex = context[0].dataIndex;
                return `${
                  holders[dataIndex]
                    ? truncateMiddle(holders[dataIndex], 20, 6)
                    : ""
                }`;
              },
              label: (context) => {
                const dataIndex = context.dataIndex;
                return dataIndex !== undefined
                  ? ` ${context.raw.toFixed(3)} (${winnerRanks[dataIndex]})`
                  : "-";
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
            title: {
              display: !dynamics.every((item) => item === 0),
              text: "Rank",
              font: {
                family: "'SF Mono Round'",
                size: 12,
              },
            },
            grid: { color: "#d3d3d322" },
          },
          y: {
            type: "logarithmic",
            grid: { color: "#d3d3d322" },
            ticks: {
              display: !dynamics.every((item) => item === 0),
              callback: function (value) {
                return value > 0 && Number.isInteger(-Math.log10(value))
                  ? value.toFixed(2)
                  : ""; // Format y-axis
              },
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
            },
          },
        },
      },
    });
  }, [
    emissionsData,
    collisionsData,
    eventsOverTime,
    colliderDistribution,
    totalDistribution,
    dynamics,
    schedule,
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
            {!isMobile && <div className="mr-1">Refresh</div>}
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
            <div>{"Emission Burns"}</div>
            <div className="relative group">
              <div className="cursor-pointer">&#9432;</div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                {`Displays the distribution of BARYON & PHOTON burns in the pool`}
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
            <div>{"Collision Reclaims"}</div>
            <div className="relative group">
              <div className="cursor-pointer">&#9432;</div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                {`Displays the distribution of PRO & ANTI reclaims in the pool`}
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
            <div>{`Events Ranges`}</div>
            <div className="relative group">
              <div className="cursor-pointer">&#9432;</div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                {`Displays the sizes of PRO & ANTI reclaims, and PHOTON & BARYON burns from the pool`}
              </span>
            </div>
          </div>
          {barChartData && (
            <div style={{ height: "250px" }}>
              <Bar data={barChartData} options={barChartData.options} />
            </div>
          )}
        </div>
        <div className="p-4 rounded-lg">
          <div className="flex justify-center gap-2 items-center font-grotesk text-gray-200">
            <div>{`Events Over Time`}</div>
            <div className="relative group">
              <div className="cursor-pointer">&#9432;</div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                {`Displays the count of PRO & ANTI reclaims, and PHOTON & BARYON burns over time`}
              </span>
            </div>
          </div>
          {lineChartData && (
            <div style={{ height: "250px" }}>
              <Line
                data={lineChartData}
                options={lineChartData.options}
                plugins={lineChartData.plugins}
              />
            </div>
          )}
        </div>
        <div className="p-4 rounded-lg">
          <div className="flex justify-center gap-2 items-center font-grotesk text-gray-200">
            <div>Final Predictions</div>
            <div className="relative group">
              <div className="cursor-pointer">&#9432;</div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                {`Displays your prediction overlapped against the global prediction`}
              </span>
            </div>
          </div>
          {netDistribution && (
            <div style={{ height: "300px" }}>
              <Line data={netDistribution} options={netDistribution.options} />
            </div>
          )}
        </div>
        <div className="p-4 rounded-lg">
          <div className="flex justify-center gap-2 items-center font-grotesk text-gray-200">
            <div>{"Gainers"}</div>
            <div className="relative group">
              <div className="cursor-pointer">&#9432;</div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-48 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                {`Displays the final gains`}
              </span>
            </div>
          </div>
          {winnerDistribution && (
            <div style={{ height: "300px" }}>
              <Bar
                data={winnerDistribution}
                options={winnerDistribution.options}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardInverter;
