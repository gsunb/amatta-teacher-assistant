import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Settings, Menu, X } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "홈", href: "/" },
    { name: "일정 관리", href: "/schedules" },
    { name: "사건 기록", href: "/records" },
    { name: "성과 평가", href: "/assessments" },
    { name: "학생 명단", href: "/students" },
  ];

  const isCurrentPage = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">Amatta</h1>
              <p className="text-xs text-gray-500 -mt-1">선생님의 AI 도우미</p>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isCurrentPage(item.href)
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <Link href="/settings" className="text-gray-400 hover:text-gray-500">
              <Settings className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-3">
              {(user as any)?.profileImageUrl && (
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={(user as any).profileImageUrl}
                  alt="프로필 이미지"
                />
              )}
              <span className="text-sm font-medium text-gray-700">
                {(user as any)?.firstName || (user as any)?.email || "사용자"}님
              </span>
            </div>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isCurrentPage(item.href)
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/settings"
              className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              설정
            </Link>
            <Button
              variant="outline"
              className="ml-3 mt-2"
              onClick={() => {
                window.location.href = "/api/logout";
              }}
            >
              로그아웃
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
