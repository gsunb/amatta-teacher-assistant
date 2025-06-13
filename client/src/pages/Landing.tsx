import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Calendar, FileText, BarChart, Users } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Calendar,
      title: "일정 관리",
      description: "수업, 회의, 상담 일정을 AI로 쉽게 관리하세요",
    },
    {
      icon: FileText,
      title: "사건 기록",
      description: "학급 내 중요한 사건들을 체계적으로 기록하세요",
    },
    {
      icon: BarChart,
      title: "성과 평가",
      description: "학생들의 학업 성과를 업로드하고 분석하세요",
    },
    {
      icon: Users,
      title: "학생 명단",
      description: "Excel/CSV로 학생 명단을 간편하게 관리하세요",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-20 pb-16 text-center">
          <div className="flex items-center justify-center mb-8">
            <GraduationCap className="h-16 w-16 text-primary mr-4" />
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-2">Amatta</h1>
              <p className="text-xl text-gray-600">선생님의 AI 도우미</p>
            </div>
          </div>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            자연어 명령으로 일정을 관리하고, 사건을 기록하며, 학생 성과를 분석하세요.
            Google Gemini AI가 선생님의 업무를 더욱 효율적으로 만들어드립니다.
          </p>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-4"
            onClick={() => {
              window.location.href = "/api/login";
            }}
          >
            시작하기
          </Button>
        </div>

        {/* Features Section */}
        <div className="pb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            주요 기능
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Features Section */}
        <div className="pb-20">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                AI 기반 자연어 처리
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                "내일 오후 2시에 학부모 상담 일정 추가해줘"와 같은 자연어 명령으로
                쉽게 업무를 처리하세요.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Google Gemini AI 연동</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
