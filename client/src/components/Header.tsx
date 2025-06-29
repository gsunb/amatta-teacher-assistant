import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Menu, 
  X, 
  Home,
  Calendar,
  FileText,
  MessageSquare,
  ClipboardList,
  Users,
  BarChart3,
  Database,
  GraduationCap
} from "lucide-react";
import amattaLogo from "@/assets/amatta-logo.png";

export default function Header() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "홈", href: "/", icon: Home },
    { name: "일정 관리", href: "/schedules", icon: Calendar },
    { name: "누가 기록", href: "/records", icon: FileText },
    { name: "평가 관리", href: "/assessments", icon: ClipboardList },
    { name: "학급 관리", href: "/classes", icon: GraduationCap },
    { name: "학급 통계", href: "/reports", icon: BarChart3 },
    { name: "학생 보고서", href: "/student-reports", icon: Users },
    { name: "학부모 소통", href: "/parent-communications", icon: MessageSquare },
    { name: "데이터 관리", href: "/data-management", icon: Database },
  ];

  const isCurrentPage = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
              <img 
                src={amattaLogo} 
                alt="Amatta 로고" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">Amatta</h1>
                <p className="text-xs text-gray-500 -mt-1">선생님의 AI 도우미</p>
              </div>
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
          <div className="px-4 pt-2 pb-4 bg-white border-t border-gray-200 shadow-lg">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                      isCurrentPage(item.href)
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <IconComponent className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium text-center">{item.name}</span>
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <Link
                href="/settings"
                className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="h-5 w-5 mr-3" />
                <span className="font-medium">설정</span>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.location.href = "/api/logout";
                }}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
