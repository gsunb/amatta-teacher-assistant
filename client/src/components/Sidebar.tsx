import { Link, useLocation } from "wouter";
import { 
  Home, 
  Calendar, 
  FileText, 
  MessageSquare, 
  ClipboardList, 
  Users, 
  BarChart3, 
  Database, 
  Settings,
  GraduationCap,
  CalendarCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: '대시보드', href: '/', icon: Home },
  { name: '일정 관리', href: '/schedules', icon: Calendar },
  { name: '누가 기록', href: '/records', icon: FileText },
  { name: '학부모 소통', href: '/parent-communications', icon: MessageSquare },
  { name: '평가 관리', href: '/assessments', icon: ClipboardList },
  { name: '학생 보고서', href: '/student-reports', icon: Users },
  { name: '학급 통계', href: '/reports', icon: BarChart3 },
  { name: '데이터 관리', href: '/data-management', icon: Database },
  { name: '설정', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 pb-6">
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="/attached_assets/image_1751162071875.png" 
              alt="Amatta 로고" 
              className="h-10 w-auto"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Amatta
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href || 
                (item.href !== '/' && location.startsWith(item.href));
              
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-600 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                        isActive 
                          ? "text-blue-600" 
                          : "text-gray-400 group-hover:text-gray-500"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User info footer */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">👩‍🏫</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">선생님</p>
              <p className="text-xs text-gray-500">AI 어시스턴트</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}