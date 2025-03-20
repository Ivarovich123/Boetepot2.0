import { useState, useEffect } from "react";
import { Link } from "wouter";

interface HeaderProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

export default function Header({ onThemeToggle, isDarkMode }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 mx-4 my-5 md:mx-6 rounded-xl bg-primary shadow-lg flex justify-between items-center p-4 md:p-5">
      <Link href="/">
        <a className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white hover:text-gray-100 transition-colors">
          Boetepot Heren 8
        </a>
      </Link>
      <div className="flex items-center space-x-4">
        <button
          className={`relative w-14 h-10 bg-white/20 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-white/30 ${
            isDarkMode ? "dark" : ""
          }`}
          onClick={onThemeToggle}
          aria-label="Toggle theme"
        >
          <i className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"} text-xl text-white transition-transform duration-300 ${isDarkMode ? "rotate-[360deg]" : ""}`}></i>
        </button>
      </div>
    </header>
  );
}
