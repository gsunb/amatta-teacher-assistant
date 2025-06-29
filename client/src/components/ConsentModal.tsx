import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, FileText, Key, UserCheck, ChevronDown, ChevronUp } from "lucide-react";
import { TEACHER_CONSENT_ITEMS, AMATTA_PRIVACY_POLICY, SERVICE_TERMS } from "@shared/privacy-policy";

interface ConsentModalProps {
  isOpen: boolean;
  onConsentComplete: () => void;
}

export default function ConsentModal({ isOpen, onConsentComplete }: ConsentModalProps) {
  const { toast } = useToast();
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [showFullPolicy, setShowFullPolicy] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);

  const submitConsentMutation = useMutation({
    mutationFn: async (consentData: Record<string, boolean>) => {
      return await apiRequest("/api/user/consents", "POST", consentData);
    },
    onSuccess: () => {
      toast({
        title: "동의 완료",
        description: "Amatta 서비스를 이용하실 수 있습니다.",
      });
      onConsentComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "동의 처리 실패",
        description: "다시 시도해 주세요. 문제가 지속되면 amatta.edu@gmail.com으로 문의해 주세요.",
        variant: "destructive",
      });
    },
  });

  const handleConsentChange = (itemId: string, checked: boolean) => {
    setConsents(prev => ({ ...prev, [itemId]: checked }));
  };

  const handleSubmit = () => {
    const requiredItems = TEACHER_CONSENT_ITEMS.filter(item => item.required);
    const missingConsents = requiredItems.filter(item => !consents[item.id]);

    if (missingConsents.length > 0) {
      toast({
        title: "필수 동의 항목 확인",
        description: "필수 동의 항목을 모두 체크해 주세요.",
        variant: "destructive",
      });
      return;
    }

    submitConsentMutation.mutate(consents);
  };

  const getConsentIcon = (itemId: string) => {
    switch (itemId) {
      case 'service_terms': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'privacy_policy': return <Shield className="h-5 w-5 text-green-600" />;
      case 'replit_oauth': return <Key className="h-5 w-5 text-purple-600" />;
      case 'ai_service_consent': return <Eye className="h-5 w-5 text-orange-600" />;
      case 'data_responsibility': return <UserCheck className="h-5 w-5 text-red-600" />;
      default: return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center text-2xl">
            <Shield className="w-7 h-7 mr-3 text-blue-600" />
            Amatta 서비스 이용 동의
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Amatta 교사 AI 도우미를 안전하게 이용하기 위한 약관 및 개인정보 처리방침입니다.
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-6">
            {/* Service Terms Preview */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-2" />
                    서비스 이용약관
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullTerms(!showFullTerms)}
                  >
                    {showFullTerms ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {showFullTerms ? '접기' : '전체 보기'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    Amatta는 교육 목적의 무료 서비스로, 교사의 학급 관리 업무를 지원합니다.
                    개인정보 보호와 데이터 보안을 최우선으로 합니다.
                  </p>
                </div>
                {showFullTerms && (
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {SERVICE_TERMS.content}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privacy Policy Preview */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-green-600 mr-2" />
                    개인정보 처리방침
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullPolicy(!showFullPolicy)}
                  >
                    {showFullPolicy ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {showFullPolicy ? '접기' : '전체 보기'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-green-800">
                    수집하는 개인정보: 교사 기본정보(Replit OAuth), 학생 교육활동 기록
                    <br />
                    보관 기간: 계정 삭제 시 즉시 완전 삭제 (별도 백업 없음)
                  </p>
                </div>
                {showFullPolicy && (
                  <div className="space-y-4">
                    {AMATTA_PRIVACY_POLICY.privacyPolicy.sections.map((section) => (
                      <div key={section.id}>
                        <h4 className="font-semibold text-gray-900 mb-2">{section.title}</h4>
                        <div className="text-sm text-gray-700 whitespace-pre-line pl-4 border-l-2 border-gray-200">
                          {section.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Consent Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">동의 항목</h3>
              {TEACHER_CONSENT_ITEMS.map((item) => (
                <Card key={item.id} className={`border-2 ${consents[item.id] ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={item.id}
                        checked={consents[item.id] || false}
                        onCheckedChange={(checked) => handleConsentChange(item.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getConsentIcon(item.id)}
                          <label htmlFor={item.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                            {item.title}
                          </label>
                          {item.required && (
                            <Badge variant="destructive" className="text-xs">필수</Badge>
                          )}
                          {!item.required && (
                            <Badge variant="secondary" className="text-xs">선택</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        <div className="space-y-1">
                          {item.details.map((detail, index) => (
                            <div key={index} className="flex items-center text-xs text-gray-500">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                              {detail}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 pt-0 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              문의: amatta.edu@gmail.com
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => window.location.href = "/api/logout"}
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitConsentMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitConsentMutation.isPending ? "처리 중..." : "동의하고 시작하기"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}