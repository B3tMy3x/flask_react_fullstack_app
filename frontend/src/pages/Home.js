// src/pages/Home.js
import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 animate-gradient-xy opacity-75"></div>

      <header className="relative z-10 w-full py-4 bg-transparent">
        <div className="container mx-auto flex justify-end px-6">
          <Link
            to="/login"
            className="text-white font-semibold py-2 px-4  rounded-md mr-2 transition duration-300 hover:bg-white hover:text-indigo-600"
          >
            Вход
          </Link>
          <Link
            to="/register"
            className="text-white font-semibold py-2 px-4 bg-indigo-600 rounded-md transition duration-300 hover:bg-indigo-700"
          >
            Регистрация
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-grow flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">
            Добро пожаловать в конструктор диаграмм!
          </h1>
          <p className="text-lg">
            Создавайте собственные графики и сохраняйте их в своем профиле.
          </p>
        </div>
      </main>

      <footer className="relative z-10 w-full py-4 text-center bg-transparent">
        <p className="text-gray-200">© 2024 ГИРЯ</p>
      </footer>
    </div>
  );
};

export default Home;
