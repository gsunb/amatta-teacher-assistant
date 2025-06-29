import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Key, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  School,
  BookOpen,
  Calendar
} from "lucide-react";
import { InsertClass } from "@shared/schema";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [grade, setGrade] = useState("");
  const [classNumber, setClassNumber] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [studentCount, setStudentCount] = useState("");

  // Check if user already has classes
  const { data: existingClasses = [] } = useQuery<any[]>({
    queryKey: ["/api/classes"],
  });

  // Save API key mutation
  const saveApiKeyMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      // Validate API key format
      if (!apiKey.startsWith('AIzaSy')) {
        throw new Error('올바른 Gemini API 키 형식이 아닙니다. AIzaSy로 시작해야 합니다.');
      }
      
      // Store API key in localStorage
      localStorage.setItem('gemini_api_key', apiKey);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "Gemini API 키가 저장되었습니다.",
      });
      setCurrentStep(3);
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (classData: InsertClass) => {
      const response = await apiRequest('POST', '/api/classes', classData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "성공",
        description: "첫 번째 학급이 생성되었습니다!",
      });
      setTimeout(() => {
        onComplete();
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApiKeySubmit = () => {
    if (!geminiApiKey.trim()) {
      toast({
        title: "알림",
        description: "API 키를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    saveApiKeyMutation.mutate(geminiApiKey);
  };

  const handleSkipApiKey = () => {
    setCurrentStep(3);
  };

  const handleClassSubmit = () => {
    if (!grade.trim() || !classNumber.trim()) {
      toast({
        title: "알림",
        description: "학년과 반을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const classData: InsertClass = {
      className: `${classNumber}반`,
      grade: grade,
      year: new Date().getFullYear().toString(),
    };

    createClassMutation.mutate(classData);
  };

  const handleSkipClass = () => {
    onComplete();
  };

  if (Array.isArray(existingClasses) && existingClasses.length > 0) {
    // User already has classes, skip onboarding
    onComplete();
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Welcome Step */}
        {currentStep === 1 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Amatta에 오신 것을 환영합니다!
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                AI 기반 교사 도우미 Amatta와 함께<br />
                더 효율적이고 스마트한 학급 운영을 시작해보세요.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">일정 관리</h3>
                  <p className="text-sm text-gray-600">자연어로 쉽게 일정을 추가하고 관리</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">기록 관리</h3>
                  <p className="text-sm text-gray-600">학급 내 사건과 평가를 체계적으로 기록</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
                  <School className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">학생 관리</h3>
                  <p className="text-sm text-gray-600">학생 정보와 성과를 한눈에 파악</p>
                </div>
              </div>

              <Button 
                onClick={() => setCurrentStep(2)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-base font-medium"
              >
                시작하기
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* API Key Setup Step */}
        {currentStep === 2 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Key className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                AI 기능 설정 (선택사항)
              </CardTitle>
              <p className="text-gray-600 mt-2">
                더 스마트한 자연어 처리를 위해 Google Gemini API 키를 연결하세요.
              </p>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 mb-1">API 키 없이도 사용 가능</h4>
                      <p className="text-sm text-blue-700">
                        기본 패턴 매칭으로 간단한 명령어는 처리됩니다. 
                        나중에 설정에서 API 키를 추가할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="api-key" className="text-base font-medium">
                    Google Gemini API 키
                  </Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy로 시작하는 API 키를 입력하세요"
                    className="text-base"
                  />
                  <p className="text-sm text-gray-500">
                    <a 
                      href="https://makersuite.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Google AI Studio
                    </a>에서 무료로 API 키를 발급받을 수 있습니다.
                  </p>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSkipApiKey}
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-50"
                  >
                    나중에 설정
                  </Button>
                  <Button
                    onClick={handleApiKeySubmit}
                    disabled={saveApiKeyMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                  >
                    {saveApiKeyMutation.isPending ? "저장 중..." : "API 키 저장"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Class Setup Step */}
        {currentStep === 3 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                첫 번째 학급 만들기
              </CardTitle>
              <p className="text-gray-600 mt-2">
                학급 정보를 입력하여 Amatta 사용을 시작하세요.
              </p>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grade" className="text-base font-medium">
                        학년 <Badge variant="secondary">필수</Badge>
                      </Label>
                      <Input
                        id="grade"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="예: 3, 중2"
                        className="text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="class-number" className="text-base font-medium">
                        반 <Badge variant="secondary">필수</Badge>
                      </Label>
                      <Input
                        id="class-number"
                        value={classNumber}
                        onChange={(e) => setClassNumber(e.target.value)}
                        placeholder="예: 1, 3"
                        className="text-base"
                      />
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>미리보기:</strong> {grade && classNumber ? `${grade}학년 ${classNumber}반` : '학년과 반을 입력하면 미리보기가 표시됩니다'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class-description" className="text-base font-medium">
                      학급 설명 <Badge variant="outline">선택</Badge>
                    </Label>
                    <Textarea
                      id="class-description"
                      value={classDescription}
                      onChange={(e) => setClassDescription(e.target.value)}
                      placeholder="학급의 특징이나 목표를 간단히 입력하세요"
                      className="resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-count" className="text-base font-medium">
                      학생 수 <Badge variant="outline">선택</Badge>
                    </Label>
                    <Input
                      id="student-count"
                      type="number"
                      value={studentCount}
                      onChange={(e) => setStudentCount(e.target.value)}
                      placeholder="예: 25"
                      className="text-base"
                      min="1"
                      max="50"
                    />
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900 mb-1">학급 생성 후에도 수정 가능</h4>
                      <p className="text-sm text-green-700">
                        나중에 학급 관리 페이지에서 정보를 수정하거나 새로운 학급을 추가할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSkipClass}
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-50"
                  >
                    나중에 설정
                  </Button>
                  <Button
                    onClick={handleClassSubmit}
                    disabled={createClassMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {createClassMutation.isPending ? "생성 중..." : "학급 생성하기"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                step <= currentStep
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}