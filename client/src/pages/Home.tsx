import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import LoadingOverlay from "@/components/LoadingOverlay";
import { 
  Calendar, 
  AlertTriangle, 
  BarChart, 
  Users, 
  Send,
  Lightbulb,
  Sparkles,
  FileText
} from "lucide-react";
import { Link } from "wouter";
import type { Schedule, Record, Assessment, Student } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");

  // Fetch upcoming schedules (7 days)
  const { data: upcomingSchedules = [] } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules/upcoming"],
  });

  // Fetch recent records
  const { data: records = [] } = useQuery<Record[]>({
    queryKey: ["/api/records"],
  });

  // Fetch assessments
  const { data: assessments = [] } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });

  // Fetch students
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Process natural language command
  const processCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      const apiKey = localStorage.getItem("gemini_api_key");
      console.log("API Key exists:", !!apiKey);
      
      const headers: { [key: string]: string } = {
        "Content-Type": "application/json",
      };
      
      if (apiKey) {
        headers["X-Gemini-API-Key"] = apiKey;
      }

      const response = await fetch("/api/process-command", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "명령 처리에 실패했습니다.");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      
      toast({
        title: "성공",
        description: data.message || "명령이 성공적으로 처리되었습니다.",
      });
      setNaturalLanguageInput("");
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitCommand = () => {
    const command = naturalLanguageInput.trim();
    if (!command) {
      toast({
        title: "알림",
        description: "명령어를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    processCommandMutation.mutate(command);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitCommand();
    }
  };

  // Filter today's schedules from upcoming schedules
  const today = new Date().toISOString().split('T')[0];
  const todaySchedules = Array.isArray(upcomingSchedules) ? upcomingSchedules.filter((schedule: Schedule) => schedule.date === today) : [];

  // Get recent records (last 3)
  const recentRecords = records.slice(0, 3);

  return (
    <>
      {processCommandMutation.isPending && (
        <LoadingOverlay message="AI가 처리 중입니다..." />
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              안녕하세요, {(user as any)?.firstName || (user as any)?.email || "선생"}님!
            </h2>
            <p className="text-lg text-gray-600">기록할 일정, 사건, 성적을 편하게 입력하세요.</p>
          </div>

          {/* Main AI Input Section */}
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="relative">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
                  자연어 명령 입력
                </h3>
                
                <Textarea
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[120px] resize-none text-base bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  placeholder="자연어로 편하게 입력하세요. 예: '내일 오후 2시에 학부모 상담 일정 추가해줘' 또는 '김루피가 이빙봉 놀려서 지도하고 학부모 상담 진행함'"
                />
                
                {/* AI Status Indicator */}
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">AI 연결됨</span>
                </div>
                
                {/* AI Status and Submit Button */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>AI가 자연어로 명령을 이해합니다</span>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleSubmitCommand}
                      disabled={processCommandMutation.isPending}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      실행하기
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Schedule Management */}
            <Link href="/schedules">
              <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border-0 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm text-blue-600 font-medium">총 {Array.isArray(upcomingSchedules) ? upcomingSchedules.length : 0}개</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">일정 관리</h3>
                  <p className="text-sm text-gray-600">수업, 회의, 상담 일정을 관리하세요</p>
                </CardContent>
              </Card>
            </Link>

            {/* Incident Records */}
            <Link href="/records">
              <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-gradient-to-br from-red-50 to-orange-100 border-0 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm text-red-600 font-medium">이번 주 {records.length}개</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">사건 기록</h3>
                  <p className="text-sm text-gray-600">학급 내 중요한 사건들을 기록하세요</p>
                </CardContent>
              </Card>
            </Link>

            {/* Performance Assessments */}
            <Link href="/assessments">
              <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-50 to-emerald-100 border-0 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <BarChart className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm text-green-600 font-medium">총 {assessments.length}개</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">평가 관리</h3>
                  <p className="text-sm text-gray-600">학생들의 학업 성과를 업로드하고 분석하세요</p>
                </CardContent>
              </Card>
            </Link>

            {/* Student Roster */}
            <Link href="/classes">
              <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50 to-violet-100 border-0 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm text-purple-600 font-medium">총 {students.length}명</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">학생 명단</h3>
                  <p className="text-sm text-gray-600">Excel/CSV로 학생 명단을 관리하세요</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Activities Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Schedules */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">오늘의 일정</h3>
                  <Link href="/schedules" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    전체 보기
                  </Link>
                </div>
              
                <div className="space-y-3">
                  {todaySchedules.length > 0 ? (
                    todaySchedules.map((schedule) => (
                      <div key={schedule.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{schedule.title}</p>
                          <p className="text-xs text-gray-500">{schedule.time}</p>
                        </div>
                        <span className="text-xs text-blue-600 font-medium px-2 py-1 bg-blue-100 rounded-full">예정</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-500">오늘 예정된 일정이 없습니다.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Records */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">최근 기록</h3>
                  <Link href="/records" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    전체 보기
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {recentRecords.length > 0 ? (
                    recentRecords.map((record) => (
                      <div key={record.id} className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            record.severity === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            record.severity === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-green-500 to-emerald-500'
                          } animate-pulse`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{record.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{record.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{record.date}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            record.severity === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                            record.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                            'bg-green-100 text-green-700 border border-green-200'
                          }`}>
                            {record.severity === 'high' ? '높음' : record.severity === 'medium' ? '보통' : '낮음'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-6 w-6 text-gray-600" />
                      </div>
                      <p className="text-sm text-gray-500">최근 기록이 없습니다.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
        </div>

          {/* AI Suggestions Section */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <Lightbulb className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">AI 제안</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">• 일정 관리에서 새로운 수업이나 상담 일정을 추가해보세요.</p>
                    <p className="text-sm text-gray-700">• 학생 명단에서 Excel 파일을 업로드하여 학생 정보를 관리해보세요.</p>
                    <p className="text-sm text-gray-700">• 자연어 명령을 사용하여 "내일 수학 수업 일정 추가해줘"와 같이 말해보세요.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
