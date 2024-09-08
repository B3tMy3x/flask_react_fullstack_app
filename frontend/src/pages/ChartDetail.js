import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { useState, useEffect } from "react";
import apiClient from "../components/apiClient";
import NavbarComponent from "../components/NavbarComponent";

const ChartDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState(null);
  const [editedChartData, setEditedChartData] = useState("");
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    apiClient
      .get(`/api/chart/${id}`)
      .then((response) => {
        setChartData(response.data);
        setEditedChartData(
          JSON.stringify(JSON.parse(response.data.data), null, 2)
        );
      })
      .catch((error) => {
        console.error("Error loading chart:", error);
        setError("Failed to load chart");
      });
  }, [id]);

  const handleSaveChanges = () => {
    try {
      const parsedData = JSON.parse(editedChartData);
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
        .put(`/api/chart/${id}`, {
          title: chartData.title,
          data: editedChartData,
        })
        .then((response) => {
          setIsModalOpen(false);
          setSuccessMessage("График успешно изменен");
          setTimeout(() => setSuccessMessage(""), 3000);
        })
        .catch((error) => {
          console.error("Failed to update chart:", error);
          setError("Failed to update chart");
        });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDeleteChart = () => {
    apiClient
      .delete(`/api/chart/${id}`)
      .then((response) => {
        navigate("/profile");
      })
      .catch((error) => {
        console.error("Failed to delete chart:", error);
        setError("Failed to delete chart");
      });
  };

  return (
    <>
      <NavbarComponent />
      <div className="container mx-auto p-4 calc-height">
        {chartData ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">{chartData.title}</h2>
            <Line data={JSON.parse(chartData.data)} />
            <div className="flex justify-between mt-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-3/4 mr-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Изменить
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-1/4 ml-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Удалить
              </button>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
        {error && <p className="text-red-500">{error}</p>}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">
              Изменить данные диаграммы
            </h3>
            <textarea
              value={editedChartData}
              onChange={(e) => setEditedChartData(e.target.value)}
              rows="10"
              className="block w-full rounded-md border border-gray-300 p-2"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="mr-2 rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              >
                Отменить
              </button>
              <button
                onClick={handleSaveChanges}
                className="mr-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить эту диаграмму?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="mr-2 rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              >
                Отменить
              </button>
              <button
                onClick={handleDeleteChart}
                className="mr-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="fixed top-4 left-0 right-0 mx-auto bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-transform duration-300 animate-fadeIn w-max">
          {successMessage}
        </div>
      )}
    </>
  );
};
export default ChartDetail;
