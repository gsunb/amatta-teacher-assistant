import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, FileText, UserCheck, CheckCircle, Loader2 } from "lucide-react";
import { TEACHER_CONSENT_ITEMS } from "@shared/privacy-policy";

interface ConsentModalProps {
  isOpen: boolean;
  onConsentComplete: () => void;
}

export default function ConsentModal({ isOpen, onConsentComplete }: ConsentModalProps) {
  const { toast } = useToast();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: checked }));
  };

  const handleSelectAll = () => {
    const allSelected: Record<string, boolean> = {};
    TEACHER_CONSENT_ITEMS.forEach(item => {
      allSelected[item.id] = true;
    });
    setCheckedItems(allSelected);
  };

  const allRequiredChecked = TEACHER_CONSENT_ITEMS
    .filter(item => item.required)
    .every(item => checkedItems[item.id]);

  const allItemsChecked = TEACHER_CONSENT_ITEMS.every(item => checkedItems[item.id]);

  const submitConsentMutation = useMutation({
    mutationFn: async () => {
      const consents = TEACHER_CONSENT_ITEMS.map(item => ({
        consentType: item.id,
        isConsented: checkedItems[item.id] || false
      }));
      
      console.log("Submitting consents:", consents);
      
      try {
        const response = await apiRequest('/api/user/consents', 'POST', { consents });
        console.log("Consent response:", response);
        return response;
      } catch (error) {
        console.error("Consent submission error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Consent submission successful:", data);
      toast({
        title: "동의 완료",
        description: "Amatta 서비스를 이용하실 수 있습니다.",
      });
      onConsentComplete();
    },
    onError: (error: Error) => {
      console.error("Consent mutation error:", error);
      toast({
        title: "오류 발생",
        description: `동의 처리 실패: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!allRequiredChecked) {
      toast({
        title: "필수 동의 필요",
        description: "필수 항목에 모두 동의해 주세요.",
        variant: "destructive",
      });
      return;
    }
    submitConsentMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl h-[95vh] sm:h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0 border-b">
          <DialogTitle className="flex items-center text-lg sm:text-2xl">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Amatta 서비스 이용 동의
          </DialogTitle>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Amatta 교사 AI 도우미를 안전하게 이용하기 위한 약관 및 개인정보 처리방침입니다.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto consent-modal-scroll">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Service Terms Summary */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  서비스 이용약관
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>Amatta는 교사들을 위한 AI 도우미 서비스로, 교육 목적으로만 사용되어야 합니다.</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>교육 목적으로만 사용</li>
                    <li>타인과 계정 공유 금지</li>
                    <li>정확한 정보 입력 및 관리</li>
                    <li>시스템 보안 수칙 준수</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Policy Summary */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Eye className="h-5 w-5 text-green-600 mr-2" />
                  개인정보 처리방침
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>Amatta는 교육 서비스 제공을 위해 필요한 최소한의 개인정보만을 수집합니다.</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>교사 기본 정보 (이름, 이메일)</li>
                    <li>학생 학습 기록 (성명, 성적)</li>
                    <li>교육 활동 데이터 (일정, 평가)</li>
                    <li>시스템 이용 기록</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Consent Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <UserCheck className="h-5 w-5 text-purple-600 mr-2" />
                  동의 항목
                </h3>
                <Button
                  type="button"
                  variant={allItemsChecked ? "secondary" : "outline"}
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  전체 동의
                </Button>
              </div>
              
              {TEACHER_CONSENT_ITEMS.map((item) => (
                <Card key={item.id} className={`border transition-colors ${
                  item.required 
                    ? checkedItems[item.id] 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-red-300 bg-red-50'
                    : checkedItems[item.id]
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={item.id}
                        checked={checkedItems[item.id] || false}
                        onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <label 
                            htmlFor={item.id}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {item.title}
                          </label>
                          <Badge variant={item.required ? "destructive" : "secondary"} className="text-xs">
                            {item.required ? "필수" : "선택"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                        {'details' in item && item.details && (
                          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                            <ul className="list-disc pl-4 space-y-1">
                              {[...item.details].map((detail, idx) => (
                                <li key={idx}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="pb-8">
              <p className="text-xs text-gray-500 text-center">
                개인정보 처리방침 전문은 설정 &gt; 개인정보처리방침에서 확인하실 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 pt-4 border-t bg-gray-50 flex-shrink-0 mobile-consent-footer">
          <div className="flex flex-col space-y-3">
            <div className="text-xs sm:text-sm text-gray-600 text-center">
              문의: amatta.edu@gmail.com
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!allRequiredChecked || submitConsentMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 w-full py-3 text-base font-medium"
              size="lg"
            >
              {submitConsentMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  처리 중...
                </div>
              ) : (
                "동의하고 시작하기"
              )}
            </Button>
            {!allRequiredChecked && (
              <p className="text-xs text-red-600 text-center">
                필수 항목에 모두 동의해 주세요
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}