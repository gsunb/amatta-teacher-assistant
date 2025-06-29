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
  Sparkles
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요, {(user as any)?.firstName || (user as any)?.email || "선생"}님!
          </h2>
          <p className="text-lg text-gray-600">기록할 일정, 사건, 성적을 편하게 입력하세요.</p>
        </div>

        {/* Main AI Input Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Textarea
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[120px] resize-none text-base"
                placeholder="자연어로 편하게 입력하세요. 예: '내일 오후 2시에 학부모 상담 일정 추가해줘' 또는 '김루피가 이빙봉 놀려서 지도하고 학부모 상담 진행함'"
              />
              
              {/* AI Status Indicator */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">AI 연결됨</span>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>AI가 자연어로 명령을 이해합니다</span>
                </div>
                <Button 
                  onClick={handleSubmitCommand}
                  disabled={processCommandMutation.isPending}
                  className="px-6"
                >
                  <Send className="h-4 w-4 mr-2" />
                  실행하기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Schedule Management */}
          <Link href="/schedules">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">총 {Array.isArray(upcomingSchedules) ? upcomingSchedules.length : 0}개</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">일정 관리</h3>
                <p className="text-sm text-gray-600">수업, 회의, 상담 일정을 관리하세요</p>
              </CardContent>
            </Card>
          </Link>

          {/* Incident Records */}
          <Link href="/records">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <span className="text-sm text-gray-500">이번 주 {records.length}개</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">사건 기록</h3>
                <p className="text-sm text-gray-600">학급 내 중요한 사건들을 기록하세요</p>
              </CardContent>
            </Card>
          </Link>

          {/* Performance Assessments */}
          <Link href="/assessments">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500">총 {assessments.length}개</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">성과 평가</h3>
                <p className="text-sm text-gray-600">학생들의 학업 성과를 업로드하고 분석하세요</p>
              </CardContent>
            </Card>
          </Link>

          {/* Student Roster */}
          <Link href="/classes">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-500">총 {students.length}명</span>
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">오늘의 일정</h3>
                <Link href="/schedules" className="text-sm text-primary hover:text-primary/80 font-medium">
                  전체 보기
                </Link>
              </div>
              
              <div className="space-y-3">
                {todaySchedules.length > 0 ? (
                  todaySchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{schedule.title}</p>
                        <p className="text-xs text-gray-500">{schedule.time}</p>
                      </div>
                      <span className="text-xs text-gray-400">예정</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    오늘 예정된 일정이 없습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Records */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">최근 기록</h3>
                <Link href="/records" className="text-sm text-primary hover:text-primary/80 font-medium">
                  전체 보기
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentRecords.length > 0 ? (
                  recentRecords.map((record) => (
                    <div key={record.id} className={`border-l-4 pl-4 py-2 ${
                      record.severity === 'high' ? 'border-red-400' :
                      record.severity === 'medium' ? 'border-yellow-400' :
                      'border-green-400'
                    }`}>
                      <p className="text-sm font-medium text-gray-900">{record.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{record.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{record.date}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    최근 기록이 없습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestions Section */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 제안</h3>
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
    </>
  );
}
