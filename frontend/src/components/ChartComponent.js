import React, { useState } from "react";
import apiClient from "./apiClient";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

const ChartComponent = () => {
  const [title, setTitle] = useState("");
  const [chartData, setChartData] = useState("");
  const [lastChart, setLastChart] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSaveChart = () => {
    if (!title.trim()) {
      setErrorMessage("Заголовок не может быть пустым.");
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    try {
      const parsedData = JSON.parse(chartData);
      if (
        !Array.isArray(parsedData.labels) ||
        !Array.isArray(parsedData.datasets)
      ) {
        throw new Error(
          "Invalid chart format. Make sure 'labels' and 'datasets' are arrays."
        );
      }
      parsedData.datasets.forEach((dataset) => {
        if (!Array.isArray(dataset.data)) {
          throw new Error("Invalid dataset format. 'data' must be an array.");
        }
      });

      apiClient
        .post("/api/save-chart", { title, chartData })
        .then(() => {
          setLastChart(parsedData);
          setSuccessMessage("График успешно создан и сохранен");
          setTimeout(() => setSuccessMessage(""), 3000);
          setErrorMessage("");
        })
        .catch((error) => {
          console.error("Error saving chart:", error);
          setErrorMessage("Failed to save chart.");
        });
    } catch (error) {
      console.error("Validation error:", error);
      setErrorMessage(error.message);
    }
  };

  const handleChartDataChange = (e) => {
    setChartData(e.target.value);
    setErrorMessage("");
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setErrorMessage("");
  };

  return (
    <>
    <div className="flex flex-col items-center justify-center p-4 calc-height">
      <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md">
        <input
          value={title}
          onChange={handleTitleChange}
          placeholder="Введите заголовок диаграммы"
          className="block w-full rounded-md border-0 py-2 pl-3 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
        />
        <textarea
          value={chartData}
          onChange={handleChartDataChange}
          placeholder="Введите данные диаграммы здесь в формате JSON"
          className="block w-full mt-4 rounded-md border-0 py-2 pl-3 pr-3 text-gray-900 min-h-24 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
        />
        <button
          onClick={handleSaveChart}
          className="mt-4 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Сохранить диаграмму
        </button>

        {errorMessage && <p className="mt-2 text-red-500">{errorMessage}</p>}
        {lastChart ? (
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Ваша диаграмма</h3>
            <div className="mt-4">
              <Line data={lastChart} />
            </div>
          </div>
        ) : (
          <p className="mt-4 text-gray-500">
            Нет диаграммы для отображения. Создайте и сохраните новую диаграмму.
          </p>
        )}
      </div>
    </div>
    {successMessage && (
      <div className="fixed top-4 left-0 right-0 mx-auto bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-transform duration-300 animate-fadeIn w-max">
        {successMessage}
      </div>
    )}
    </>
  );
};

export default ChartComponent;
