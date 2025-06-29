import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, Mail, Phone, ExternalLink } from "lucide-react";
import { AMATTA_PRIVACY_POLICY } from "@shared/privacy-policy";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/settings")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          설정으로 돌아가기
        </Button>
        
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            {AMATTA_PRIVACY_POLICY.privacyPolicy.title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <Badge variant="outline">
            버전 {AMATTA_PRIVACY_POLICY.version}
          </Badge>
          <span>시행일: {AMATTA_PRIVACY_POLICY.effectiveDate}</span>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">개인정보 보호 약속</h3>
                <p className="text-blue-800 text-sm">
                  Amatta는 교사와 학생의 개인정보를 안전하게 보호하며, 
                  교육 목적으로만 사용합니다. 모든 데이터는 암호화되어 저장되며, 
                  계정 삭제 시 즉시 완전 삭제됩니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {AMATTA_PRIVACY_POLICY.privacyPolicy.sections.map((section, index) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  {index + 1}
                </div>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {section.content}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Separator />

        {/* Contact Information */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Mail className="h-5 w-5 mr-2" />
              문의 및 지원
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-green-800 mb-1">개인정보보호 담당자</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <a href="mailto:amatta.edu@gmail.com" className="hover:underline">
                        amatta.edu@gmail.com
                      </a>
                    </div>
                    <div>처리기간: 접수 후 3일 이내 답변</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-green-800 mb-2">개인정보 분쟁조정 기관</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>개인정보보호위원회</span>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        <span>182</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>개인정보 침해신고센터</span>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        <span>118</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-3 border-t border-green-200">
              <p className="text-xs text-green-600">
                ※ 개인정보 처리와 관련된 모든 문의사항은 언제든지 연락해 주시기 바랍니다.
                신속하고 정확한 답변을 드리도록 하겠습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>개인정보 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/data-management")}
                className="h-auto py-3 flex flex-col items-center"
              >
                <ExternalLink className="h-5 w-5 mb-2" />
                <span className="font-medium">데이터 내보내기</span>
                <span className="text-xs text-gray-500">백업 및 다운로드</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setLocation("/settings")}
                className="h-auto py-3 flex flex-col items-center"
              >
                <Shield className="h-5 w-5 mb-2" />
                <span className="font-medium">계정 설정</span>
                <span className="text-xs text-gray-500">개인정보 수정</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open("mailto:amatta.edu@gmail.com", "_blank")}
                className="h-auto py-3 flex flex-col items-center"
              >
                <Mail className="h-5 w-5 mb-2" />
                <span className="font-medium">문의하기</span>
                <span className="text-xs text-gray-500">개인정보 관련 문의</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}