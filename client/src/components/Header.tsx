import { useState, useEffect } from "react";

interface HeaderProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

export default function Header({ onThemeToggle, isDarkMode }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 mx-4 my-5 md:mx-6 rounded-xl bg-gradient-to-r from-primary to-secondary shadow-lg flex justify-between items-center p-4 md:p-5">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white">
        Boetepot Heren 8
      </h1>
      <button
        className={`relative w-20 h-10 bg-primary rounded-full cursor-pointer transition-all duration-300 flex items-center justify-center ${
          isDarkMode ? "dark" : ""
        }`}
        onClick={onThemeToggle}
      >
        <i className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"} text-2xl text-white transition-transform duration-300 ${isDarkMode ? "rotate-[360deg]" : ""}`}></i>
      </button>
    </header>
  );
}
