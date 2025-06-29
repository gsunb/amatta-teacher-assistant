import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  GraduationCap, 
  Calendar, 
  FileText, 
  BarChart, 
  Users, 
  Sparkles, 
  ArrowRight,
  Check,
  Star
} from "lucide-react";
import { SiGoogle } from "react-icons/si";
import amattaLogo from "@/assets/amatta-logo.png";

export default function Landing() {
  const [isGoogleAuthAvailable, setIsGoogleAuthAvailable] = useState(false);

  useEffect(() => {
    fetch('/api/auth/google/available')
      .then(res => res.json())
      .then(data => setIsGoogleAuthAvailable(data.available))
      .catch(() => setIsGoogleAuthAvailable(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src={amattaLogo} 
                alt="Amatta 로고" 
                className="h-10 w-auto"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Amatta</span>
            </div>
            <div className="flex items-center space-x-6">
              <Button
                onClick={() => window.location.href = "/api/login"}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                시작하기
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <img 
                src={amattaLogo} 
                alt="Amatta 로고" 
                className="h-20 w-auto"
              />
            </div>
            
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-blue-100 text-blue-700 border-blue-200">
              <Sparkles className="h-4 w-4 mr-2" />
              AI 기반 교육 플랫폼
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              "아, 맞다!" 
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                깜빡해도 괜찮아요
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-gray-700 mb-6 max-w-3xl mx-auto font-medium">
              정신없는 학교 생활, 자연어로 기록해요
            </p>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto font-medium">
              복잡한 클릭 없이, 말하는 것처럼 간단하게
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                onClick={() => window.location.href = "/api/login"}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => window.location.href = "/api/auth/google"}
                size="lg"
                variant="outline"
                className="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 시작하기
              </Button>
            </div>

            {/* Feature Highlights */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 mb-16">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>베타 서비스 운영 중</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>무료 체험 가능</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Google Gemini AI 연동</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden mx-auto max-w-6xl transform perspective-1000 rotate-x-12">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-3"></div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Amatta 대시보드</h3>
                      <p className="text-sm text-gray-500">교사 AI 도우미</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">일정 관리</span>
                      </div>
                      <span className="text-xs text-blue-600 font-medium">5개</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700 mb-2">오늘의 수업</div>
                    <div className="text-sm text-blue-600">3교시 수학, 5교시 과학</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-orange-100 p-6 rounded-2xl border border-red-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">누가기록</span>
                      </div>
                      <span className="text-xs text-red-600 font-medium">2건</span>
                    </div>
                    <div className="text-2xl font-bold text-red-700 mb-2">최근 기록</div>
                    <div className="text-sm text-red-600">김철수 주의사항</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <BarChart className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">평가 관리</span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">완료</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700 mb-2">수학 시험</div>
                    <div className="text-sm text-green-600">평균 85점</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800">오늘 오후 3시 부장회의 완료</span>
                    </div>
                    <span className="text-xs text-gray-500">완료</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800">내일 학부모 상담 예정</span>
                    </div>
                    <span className="text-xs text-gray-500">14:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-indigo-100 text-indigo-700 border-indigo-200">
              강력한 기능들
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              교육 현장의 모든 업무를 하나로
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI 기반의 스마트한 교육 솔루션으로 더 효율적인 교실 관리를 경험하세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">일정 관리</h3>
                <p className="text-gray-600 mb-4">
                  "내일 3교시에 과학 실험 수업이 있어" → 자동으로 일정 등록<br/>
                  "다음 주 화요일 학부모 상담" → 스케줄에 추가
                </p>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">예시: 수업, 회의, 상담 일정을 자연어로 한번에</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-orange-100">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">누가기록</h3>
                <p className="text-gray-600 mb-4">
                  "김철수가 수업 중 장난을 쳤다" → 자동으로 생활기록 저장<br/>
                  "이영희가 친구와 다투었음" → 상담 필요 학생으로 분류
                </p>
                <div className="bg-red-100 p-3 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">예시: 학급 내 사건, 행동 관찰을 즉시 기록</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-100">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">평가 관리</h3>
                <p className="text-gray-600 mb-4">
                  Excel 파일로 성적 업로드하면 자동 분석<br/>
                  "수학 중간고사 결과가 나왔어" → 성적 트렌드 파악
                </p>
                <div className="bg-green-100 p-3 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">예시: 시험 성적, 과제 점수를 간편하게 관리</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            수천 명의 교사들이 이미 Amatta로 더 스마트한 교실 관리를 경험하고 있습니다.
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            className="bg-white hover:bg-gray-50 text-blue-600 px-10 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            무료로 시작하기
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-8 md:mb-0">
              <img 
                src={amattaLogo} 
                alt="Amatta 로고" 
                className="h-10 w-auto"
              />
              <span className="text-2xl font-bold">Amatta</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 Amatta. 모든 권리 보유.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
