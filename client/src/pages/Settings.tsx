import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings as SettingsIcon, Key, Save, Eye, EyeOff } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load API key from localStorage on component mount
    const savedApiKey = localStorage.getItem("gemini_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsConnected(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "오류",
        description: "API 키를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      localStorage.setItem("gemini_api_key", apiKey.trim());
      setIsConnected(true);
      toast({
        title: "성공",
        description: "Gemini API 키가 저장되었습니다.",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "API 키 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    setIsConnected(false);
    toast({
      title: "성공",
      description: "API 키가 삭제되었습니다.",
    });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-6">
        <SettingsIcon className="h-8 w-8 text-gray-700 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">설정</h1>
      </div>

      <div className="space-y-6">
        {/* Gemini API Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Google Gemini API 설정</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API 키</Label>
              <div className="relative mt-2">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Google Gemini API 키를 입력하세요"
                  className="pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {isConnected && (
              <Alert className="border-green-200 bg-green-50">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <AlertDescription className="text-green-800">
                    Gemini API가 연결되었습니다.
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Google AI Studio에서 API 키를 발급받을 수 있습니다.
              </p>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary/80 underline"
              >
                Google AI Studio에서 API 키 발급받기 →
              </a>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSaveApiKey}>
                <Save className="h-4 w-4 mr-2" />
                저장
              </Button>
              {isConnected && (
                <Button variant="outline" onClick={handleRemoveApiKey}>
                  API 키 삭제
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>계정 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Replit 계정으로 로그인되어 있습니다. 로그아웃하려면 아래 버튼을 클릭하세요.
              </p>
              <Button variant="outline" onClick={handleLogout}>
                로그아웃
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage Information */}
        <Card>
          <CardHeader>
            <CardTitle>사용 안내</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">자연어 명령 예시:</h4>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li>• "내일 오후 2시에 학부모 상담 일정 추가해줘"</li>
                  <li>• "김철수 학생 지각 기록 추가해줘"</li>
                  <li>• "이번 주 수학 시험 결과 정리해줘"</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">파일 업로드 지원:</h4>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li>• 학생 명단: CSV 파일 (이름, 학번, 학년, 반)</li>
                  <li>• 성과 평가: 텍스트 형식 (과목, 단원, 과제, 학생, 점수)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
