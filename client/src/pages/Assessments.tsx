import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Plus, Trash2, Upload, TrendingUp, Users, Download } from "lucide-react";
import type { Assessment, InsertAssessment } from "@shared/schema";

export default function Assessments() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadText, setUploadText] = useState("");

  // Fetch assessments
  const { data: assessments = [], isLoading } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });

  // Upload assessments mutation
  const uploadAssessmentsMutation = useMutation({
    mutationFn: async (text: string) => {
      // Parse the text into assessment items
      const lines = text.trim().split('\n').filter(line => line.trim());
      const items: InsertAssessment[] = [];

      for (const line of lines) {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length >= 3) {
          items.push({
            subject: parts[0],
            unit: parts[1],
            task: parts[2],
            studentName: parts[3] || undefined,
            score: parts[4] ? parseInt(parts[4]) : undefined,
            maxScore: parts[5] ? parseInt(parts[5]) : undefined,
            notes: parts[6] || undefined,
          });
        }
      }

      return await apiRequest("POST", "/api/assessments/upload", { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      toast({
        title: "성공",
        description: "평가가 성공적으로 업로드되었습니다.",
      });
      setIsUploading(false);
      setUploadText("");
    },
    onError: () => {
      toast({
        title: "오류",
        description: "평가 업로드에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Delete assessment mutation
  const deleteAssessmentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/assessments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      toast({
        title: "성공",
        description: "평가가 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "평가 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const downloadTemplate = () => {
    const csvContent = "과목,단원,과제명,학생명,점수,만점,비고\n수학,1단원,중간고사,김철수,85,100,잘함\n국어,2단원,쪽지시험,이영희,92,100,우수\n영어,3단원,발표평가,박민수,78,100,노력필요";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "성과평가_템플릿.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "다운로드 완료",
      description: "성과 평가 템플릿이 다운로드되었습니다.",
    });
  };

  const handleUpload = () => {
    if (!uploadText.trim()) {
      toast({
        title: "알림",
        description: "업로드할 데이터를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    uploadAssessmentsMutation.mutate(uploadText);
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Calculate statistics for dashboard
  const subjectStats = assessments.reduce((acc, assessment) => {
    if (!assessment.score || !assessment.maxScore) return acc;
    
    if (!acc[assessment.subject]) {
      acc[assessment.subject] = { total: 0, count: 0, scores: [] };
    }
    
    const percentage = (assessment.score / assessment.maxScore) * 100;
    acc[assessment.subject].total += percentage;
    acc[assessment.subject].count += 1;
    acc[assessment.subject].scores.push(percentage);
    
    return acc;
  }, {} as Record<string, { total: number; count: number; scores: number[] }>);

  const studentStats = assessments.reduce((acc, assessment) => {
    if (!assessment.studentName || !assessment.score || !assessment.maxScore) return acc;
    
    if (!acc[assessment.studentName]) {
      acc[assessment.studentName] = { total: 0, count: 0, scores: [] };
    }
    
    const percentage = (assessment.score / assessment.maxScore) * 100;
    acc[assessment.studentName].total += percentage;
    acc[assessment.studentName].count += 1;
    acc[assessment.studentName].scores.push(percentage);
    
    return acc;
  }, {} as Record<string, { total: number; count: number; scores: number[] }>);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">성과 평가</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            템플릿 다운로드
          </Button>
          <Button onClick={() => setIsUploading(!isUploading)}>
            <Upload className="h-4 w-4 mr-2" />
            평가 업로드
          </Button>
        </div>
      </div>

      {/* Performance Dashboard */}
      {assessments.length > 0 && (
        <div className="mb-8 space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">총 평가 수</p>
                    <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
                  </div>
                  <BarChart className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">평가 과목 수</p>
                    <p className="text-2xl font-bold text-gray-900">{Object.keys(subjectStats).length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">평가된 학생 수</p>
                    <p className="text-2xl font-bold text-gray-900">{Object.keys(studentStats).length}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subject Performance */}
          {Object.keys(subjectStats).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>과목별 성과 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(subjectStats).map(([subject, stats]) => {
                    const average = stats.total / stats.count;
                    return (
                      <div key={subject} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{subject}</span>
                          <span className="text-sm text-gray-600">
                            평균: {average.toFixed(1)}% ({stats.count}개 평가)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full"
                            style={{ width: `${Math.min(average, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Student Performance */}
          {Object.keys(studentStats).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>학생별 성과 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(studentStats)
                    .sort(([,a], [,b]) => (b.total / b.count) - (a.total / a.count))
                    .map(([studentName, stats]) => {
                      const average = stats.total / stats.count;
                      const performanceLevel = 
                        average >= 90 ? { label: '우수', color: 'bg-green-100 text-green-800' } :
                        average >= 80 ? { label: '양호', color: 'bg-blue-100 text-blue-800' } :
                        average >= 70 ? { label: '보통', color: 'bg-yellow-100 text-yellow-800' } :
                        { label: '노력필요', color: 'bg-red-100 text-red-800' };

                      return (
                        <Card key={studentName} className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-900">{studentName}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${performanceLevel.color}`}>
                                {performanceLevel.label}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">평균 점수</span>
                                <span className="font-medium">{average.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${Math.min(average, 100)}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500">{stats.count}개 평가 완료</p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Upload Form */}
      {isUploading && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>평가 데이터 업로드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                각 줄에 다음 형식으로 입력하세요: 과목, 단원, 과제, 학생이름, 점수, 만점, 비고
              </p>
              <p className="text-xs text-gray-500 mb-4">
                예: 수학, 2차 함수, 중간고사, 김철수, 85, 100, 우수
              </p>
              <Textarea
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                placeholder="수학, 2차 함수, 중간고사, 김철수, 85, 100, 우수
영어, 문법, 퀴즈, 이영희, 92, 100, 매우 우수
과학, 물리, 실험보고서, 박민수, 78, 100"
                rows={8}
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleUpload}
                disabled={uploadAssessmentsMutation.isPending}
              >
                {uploadAssessmentsMutation.isPending ? "업로드 중..." : "업로드"}
              </Button>
              <Button variant="outline" onClick={() => setIsUploading(false)}>
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessments List */}
      <div className="space-y-4">
        {assessments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">평가 데이터가 없습니다</h3>
              <p className="text-gray-500 mb-4">첫 번째 평가를 업로드해보세요.</p>
              <Button onClick={() => setIsUploading(true)}>
                <Upload className="h-4 w-4 mr-2" />
                평가 업로드
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {assessment.subject}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {assessment.unit} - {assessment.task}
                      </p>
                      {assessment.studentName && (
                        <p className="text-sm text-gray-500">
                          학생: {assessment.studentName}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAssessmentMutation.mutate(assessment.id)}
                      disabled={deleteAssessmentMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {assessment.score !== null && assessment.maxScore !== null && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>점수</span>
                        <span className="font-semibold">
                          {assessment.score}/{assessment.maxScore}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(assessment.score / assessment.maxScore) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {Math.round((assessment.score / assessment.maxScore) * 100)}%
                      </div>
                    </div>
                  )}

                  {assessment.notes && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {assessment.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
