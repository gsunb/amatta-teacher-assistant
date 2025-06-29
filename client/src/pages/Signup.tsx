import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FaGoogle } from "react-icons/fa";
import { Eye, EyeOff, ArrowLeft, Chrome } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/auth/register', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "회원가입 성공",
        description: data.message,
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "회원가입 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "입력 오류",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "입력 오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(formData);
  };

  const handleGoogleSignup = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                돌아가기
              </Button>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
          <CardDescription className="text-center">
            Amatta 계정을 만들어 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth Signup Options */}
          <div className="space-y-3">
            <Button
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
              asChild
            >
              <a href="/api/login">
                <Chrome className="w-4 h-4 mr-2" />
                Replit으로 가입하기
              </a>
            </Button>
            
            <Button
              onClick={handleGoogleSignup}
              variant="outline"
              className="w-full"
              type="button"
            >
              <FaGoogle className="w-4 h-4 mr-2" />
              Google로 가입하기
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          {/* Regular Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">성</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="홍"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">이름</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="길동"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="6자 이상 입력"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "가입 중..." : "회원가입"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">이미 계정이 있나요? </span>
            <Link href="/login">
              <Button variant="link" className="p-0 h-auto">
                로그인
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}