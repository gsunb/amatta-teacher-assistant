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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Amatta</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                기능
              </a>
              <a href="#demo" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                데모
              </a>
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
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-blue-100 text-blue-700 border-blue-200">
              <Sparkles className="h-4 w-4 mr-2" />
              AI 기반 교육 플랫폼
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              가장 빠르고 정확한
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI 교육 도구
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              교사들의 업무를 혁신하는 AI 어시스턴트로 학급 관리, 성과 평가, 학부모 소통을 
              <span className="font-semibold text-blue-600"> 한 곳에서 효율적으로</span> 처리하세요.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  무료 체험 시작
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center"
                >
                  로그인
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 hover:border-gray-400 px-8 py-4 text-lg font-medium rounded-xl transition-all"
              >
                데모 보기
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 mb-16">
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />)}
                </div>
                <span>4.9/5 평점</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>1,000+ 활성 사용자</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>99.9% 가동률</span>
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
                      <div className="h-5 bg-gray-800 rounded-lg w-32 mb-2"></div>
                      <div className="h-3 bg-gray-400 rounded w-20"></div>
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
                      <div className="h-4 bg-blue-300 rounded w-16"></div>
                      <Badge className="bg-blue-600 text-white text-xs">84%</Badge>
                    </div>
                    <div className="h-8 bg-blue-600 rounded-lg w-16 mb-3"></div>
                    <div className="h-3 bg-blue-300 rounded w-24"></div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-4 bg-indigo-300 rounded w-20"></div>
                      <Badge className="bg-indigo-600 text-white text-xs">87%</Badge>
                    </div>
                    <div className="h-8 bg-indigo-600 rounded-lg w-16 mb-3"></div>
                    <div className="h-3 bg-indigo-300 rounded w-28"></div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-4 bg-purple-300 rounded w-18"></div>
                      <Badge className="bg-purple-600 text-white text-xs">78%</Badge>
                    </div>
                    <div className="h-8 bg-purple-600 rounded-lg w-16 mb-3"></div>
                    <div className="h-3 bg-purple-300 rounded w-22"></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-300 rounded w-48"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-300 rounded w-40"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">스마트 일정 관리</h3>
                <p className="text-gray-600 mb-4">
                  자연어 입력으로 쉽게 일정을 등록하고, AI가 자동으로 분류해 효율적인 스케줄 관리를 제공합니다.
                </p>
                <div className="flex items-center text-blue-600 font-semibold">
                  <span className="text-2xl mr-2">84%</span>
                  <span className="text-sm">시간 절약</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">지능형 성과 분석</h3>
                <p className="text-gray-600 mb-4">
                  학생별 성취도를 자동 분석하고 맞춤형 학습 가이드를 제공하여 개별 학습 관리를 지원합니다.
                </p>
                <div className="flex items-center text-indigo-600 font-semibold">
                  <span className="text-2xl mr-2">87%</span>
                  <span className="text-sm">정확도 향상</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">원활한 소통 관리</h3>
                <p className="text-gray-600 mb-4">
                  학부모와의 소통 기록을 체계적으로 관리하고, 상담 일정 자동 알림으로 놓치는 일이 없습니다.
                </p>
                <div className="flex items-center text-purple-600 font-semibold">
                  <span className="text-2xl mr-2">78%</span>
                  <span className="text-sm">만족도 증가</span>
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
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
