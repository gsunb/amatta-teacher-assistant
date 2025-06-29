import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Chrome, Zap, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<'choose' | 'email-login' | 'email-signup' | 'forgot-password'>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      console.log("Attempting login with:", data.email);
      const response = await apiRequest("POST", "/api/auth/login", data);
      const result = await response.json();
      console.log("Login result:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Login successful:", data);
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      });
      onClose();
      window.location.reload();
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "로그인 실패",
        description: error.message.replace(/^\d+:\s*/, ""),
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", { 
        ...data, 
        confirmPassword: data.password 
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "회원가입 성공",
        description: "계정이 생성되었습니다. 로그인해주세요.",
      });
      setMode('email-login');
      setPassword('');
    },
    onError: (error: Error) => {
      toast({
        title: "회원가입 실패",
        description: error.message.replace(/^\d+:\s*/, ""),
        variant: "destructive",
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiRequest("POST", "/api/auth/forgot-password", data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      console.log("Password reset response:", data);
      toast({
        title: "비밀번호 재설정",
        description: data.resetLink ? "재설정 링크를 새 탭에서 열었습니다." : data.message,
        duration: 5000,
      });
      if (data.resetLink) {
        // Open reset link in new tab for development
        const newWindow = window.open(data.resetLink, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
          // Fallback if popup blocked
          toast({
            title: "팝업 차단됨",
            description: `링크를 수동으로 열어주세요: ${data.resetLink}`,
            duration: 10000,
          });
        }
      }
      setMode('email-login');
    },
    onError: (error: Error) => {
      console.error("Password reset error:", error);
      toast({
        title: "오류",
        description: error.message.replace(/^\d+:\s*/, ""),
        variant: "destructive",
      });
    },
  });

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    signupMutation.mutate({ email, password, firstName: firstName || undefined, lastName: lastName || undefined });
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "입력 오류",
        description: "이메일을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    forgotPasswordMutation.mutate({ email });
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const handleReplitLogin = () => {
    window.location.href = "/api/login";
  };

  const resetModal = () => {
    setMode('choose');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setShowPassword(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === 'choose' && '로그인 방법을 선택하세요'}
            {mode === 'email-login' && '이메일로 로그인'}
            {mode === 'email-signup' && '계정 만들기'}
            {mode === 'forgot-password' && '비밀번호 찾기'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'choose' && (
          <div className="space-y-4 py-4">
            <Button
              onClick={() => setMode('email-login')}
              variant="outline"
              className="w-full h-12 text-left justify-start"
            >
              <Mail className="h-5 w-5 mr-3 text-blue-600" />
              <div>
                <div className="font-medium">이메일로 로그인</div>
                <div className="text-xs text-gray-500">기존 계정 또는 새 계정 생성</div>
              </div>
            </Button>

            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-12 text-left justify-start"
            >
              <Chrome className="h-5 w-5 mr-3 text-red-600" />
              <div>
                <div className="font-medium">Google로 로그인</div>
                <div className="text-xs text-gray-500">Google 계정으로 빠른 로그인</div>
              </div>
            </Button>

            <Button
              onClick={handleReplitLogin}
              variant="outline"
              className="w-full h-12 text-left justify-start"
            >
              <Zap className="h-5 w-5 mr-3 text-orange-600" />
              <div>
                <div className="font-medium">Replit으로 로그인</div>
                <div className="text-xs text-gray-500">Replit 계정으로 로그인</div>
              </div>
            </Button>
          </div>
        )}

        {mode === 'email-login' && (
          <form onSubmit={handleEmailLogin} className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "로그인 중..." : "로그인"}
              </Button>
              <Separator />
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setMode('email-signup')}
              >
                계정이 없나요? 회원가입하기
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full text-sm"
                onClick={() => setMode('forgot-password')}
              >
                비밀번호를 잊으셨나요?
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setMode('choose')}
              >
                다른 방법으로 로그인
              </Button>
            </div>
          </form>
        )}

        {mode === 'email-signup' && (
          <form onSubmit={handleEmailSignup} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="firstName">이름 (선택)</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="김"
                />
              </div>
              <div>
                <Label htmlFor="lastName">성 (선택)</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="철수"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8자 이상의 비밀번호"
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? "계정 생성 중..." : "계정 만들기"}
              </Button>
              <Separator />
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setMode('email-login')}
              >
                이미 계정이 있나요? 로그인하기
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setMode('choose')}
              >
                다른 방법으로 로그인
              </Button>
            </div>
          </form>
        )}

        {mode === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="가입한 이메일을 입력하세요"
                required
              />
            </div>
            <div className="space-y-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending ? "전송 중..." : "비밀번호 재설정 링크 보내기"}
              </Button>
              <Separator />
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setMode('email-login')}
              >
                로그인으로 돌아가기
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setMode('choose')}
              >
                다른 방법으로 로그인
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}