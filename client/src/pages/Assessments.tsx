import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { BarChart, Plus, Trash2, Upload, TrendingUp, Users, Download, Grid, List, FileSpreadsheet, Filter, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from 'xlsx';
import type { Assessment, InsertAssessment } from "@shared/schema";

export default function Assessments() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [viewMode, setViewMode] = useState<'dashboard' | 'by-task'>('dashboard');
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterExam, setFilterExam] = useState("all");
  const [sortBy, setSortBy] = useState<'score-high' | 'score-low' | 'student-name'>('score-high');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch assessments and students
  const { data: assessments = [], isLoading } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ["/api/students"],
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
    // Create simple Excel template with only essential fields
    const templateData = [
      ['번호', '이름', '과목', '단원', '종류', '점수', '만점'],
      [1, '김철수', '수학', '2차 함수', '중간고사', 85, 100],
      [2, '이영희', '국어', '문학', '수행평가', 92, 100],
      [3, '박민수', '영어', '독해', '단어시험', 78, 100],
      [4, '정수현', '과학', '물리', '실험보고서', 88, 100],
      [5, '한지원', '사회', '근현대사', '발표과제', 95, 100]
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    
    // Set column widths for better display
    ws['!cols'] = [
      { wch: 8 },  // 번호
      { wch: 12 }, // 이름
      { wch: 10 }, // 과목
      { wch: 15 }, // 단원
      { wch: 12 }, // 종류
      { wch: 8 },  // 점수
      { wch: 8 }   // 만점
    ];

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, '성과평가');
    
    // Generate Excel file
    XLSX.writeFile(wb, '성과평가_템플릿.xlsx');

    toast({
      title: "다운로드 완료",
      description: "Excel 템플릿이 다운로드되었습니다. 7개 열: 번호, 이름, 과목, 단원, 종류, 점수, 만점",
    });
  };

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        let rows: any[][] = [];

        // Check if it's a CSV file
        if (file.name.toLowerCase().endsWith('.csv')) {
          // Handle CSV with proper Korean encoding
          const lines = data.split('\n').filter(line => line.trim());
          rows = lines.map(line => {
            // Split by comma but handle quoted values
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          });
        } else {
          // Handle Excel files
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          rows = jsonData as any[][];
        }

        // Skip header row and process data
        const dataRows = rows.slice(1);
        const assessments: InsertAssessment[] = [];

        for (const row of dataRows) {
          if (row.length >= 7 && row[1] && row[2] && row[4]) {
            assessments.push({
              studentName: String(row[1] || '').trim(), // 이름
              subject: String(row[2] || '').trim(),     // 과목
              unit: String(row[3] || '').trim(),        // 단원
              task: String(row[4] || '').trim(),        // 종류
              score: Number(row[5]) || 0,               // 점수
              maxScore: Number(row[6]) || 100,          // 만점
            });
          }
        }

        if (assessments.length > 0) {
          // Convert to text format for existing upload function
          const textData = assessments.map(a => 
            `${a.subject}, ${a.unit}, ${a.task}, ${a.studentName}, ${a.score}, ${a.maxScore}`
          ).join('\n');
          
          setUploadText(textData);
          uploadAssessmentsMutation.mutate(textData);
          
          toast({
            title: "업로드 성공",
            description: `${assessments.length}개의 평가 데이터가 업로드되었습니다.`,
          });
        } else {
          toast({
            title: "업로드 실패",
            description: "올바른 데이터를 찾을 수 없습니다. 템플릿 형식을 확인해주세요.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('File upload error:', error);
        toast({
          title: "파일 읽기 오류",
          description: "파일을 읽는 중 오류가 발생했습니다. 파일 형식을 확인해주세요.",
          variant: "destructive",
        });
      }
    };

    // Read as text for CSV, as array buffer for Excel
    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsArrayBuffer(file);
    }
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

  // Get unique subjects and exam types for filters
  const uniqueSubjects = Array.from(new Set(assessments.map(a => a.subject)));
  const uniqueExamTypes = Array.from(new Set(assessments.map(a => a.task)));

  // Filter assessments based on selected filters
  const filteredAssessments = assessments.filter(assessment => {
    const subjectMatch = filterSubject === "all" || assessment.subject === filterSubject;
    const examMatch = filterExam === "all" || assessment.task === filterExam;
    return subjectMatch && examMatch;
  });

  // Sort assessments based on selected sort option
  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    switch (sortBy) {
      case 'score-high':
        const percentageA = a.score && a.maxScore ? (a.score / a.maxScore) * 100 : 0;
        const percentageB = b.score && b.maxScore ? (b.score / b.maxScore) * 100 : 0;
        return percentageB - percentageA;
      case 'score-low':
        const percentageA2 = a.score && a.maxScore ? (a.score / a.maxScore) * 100 : 0;
        const percentageB2 = b.score && b.maxScore ? (b.score / b.maxScore) * 100 : 0;
        return percentageA2 - percentageB2;
      case 'student-name':
        return (a.studentName || '').localeCompare(b.studentName || '');
      default:
        return 0;
    }
  });

  // Calculate statistics for dashboard
  const subjectStats = filteredAssessments.reduce((acc, assessment) => {
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

  // Group assessments by task for comparison view
  const taskGroups = assessments.reduce((acc, assessment) => {
    const taskKey = `${assessment.subject} - ${assessment.unit} - ${assessment.task}`;
    if (!acc[taskKey]) {
      acc[taskKey] = [];
    }
    acc[taskKey].push(assessment);
    return acc;
  }, {} as Record<string, Assessment[]>);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">성과 평가</h1>
        <div className="flex space-x-2">
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setViewMode('dashboard')}
              size="sm"
              className="rounded-none"
            >
              <BarChart className="h-4 w-4 mr-2" />
              대시보드
            </Button>
            <Button
              variant={viewMode === 'by-task' ? 'default' : 'ghost'}
              onClick={() => setViewMode('by-task')}
              size="sm"
              className="rounded-none"
            >
              <Grid className="h-4 w-4 mr-2" />
              과제별 비교
            </Button>
          </div>
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

      {/* Filters and Sorting */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">과목 필터</label>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger>
                <SelectValue placeholder="전체 과목" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 과목</SelectItem>
                {uniqueSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">단원 필터</label>
            <Select value={filterExam} onValueChange={setFilterExam}>
              <SelectTrigger>
                <SelectValue placeholder="전체 단원" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 단원</SelectItem>
                {uniqueUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">정렬 기준</label>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="정렬 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score-high">점수 높은 순</SelectItem>
                <SelectItem value="score-low">점수 낮은 순</SelectItem>
                <SelectItem value="student-name">학생 이름순</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">필터 초기화</label>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterSubject("all");
                setFilterExam("all");
                setSortBy("score-high");
              }}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              초기화
            </Button>
          </div>
        </div>
      </div>

      {/* Task-by-Task Comparison View */}
      {viewMode === 'by-task' && assessments.length > 0 && (
        <div className="mb-8 space-y-6">
          {Object.entries(taskGroups).map(([taskKey, taskAssessments]) => {
            const sortedAssessments = taskAssessments
              .filter(a => a.score !== null && a.maxScore !== null)
              .sort((a, b) => ((b.score! / b.maxScore!) - (a.score! / a.maxScore!)) * 100);

            if (sortedAssessments.length === 0) return null;

            return (
              <Card key={taskKey}>
                <CardHeader>
                  <CardTitle className="text-lg">{taskKey}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sortedAssessments.map((assessment, index) => {
                      const percentage = assessment.score && assessment.maxScore 
                        ? (assessment.score / assessment.maxScore) * 100 
                        : 0;
                      
                      const rankColor = 
                        index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-gray-500' :
                        index === 2 ? 'text-orange-600' : 'text-gray-700';

                      return (
                        <div key={assessment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className={`font-bold text-lg ${rankColor}`}>
                              {index + 1}위
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">
                                {assessment.studentName || '이름 없음'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {assessment.score}점 / {assessment.maxScore}점
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {percentage.toFixed(1)}%
                            </p>
                            <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Performance Dashboard */}
      {viewMode === 'dashboard' && assessments.length > 0 && (
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
            {/* Excel Upload Section */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Excel 파일 업로드</h4>
                <div className="flex items-center space-x-4">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <Button 
                    variant="outline" 
                    onClick={downloadTemplate}
                    size="sm"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    템플릿 다운로드
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  CSV 또는 Excel 파일(.csv, .xlsx, .xls)을 선택하면 자동으로 업로드됩니다. 
                  <br />템플릿을 다운로드하여 형식을 확인하고, CSV 파일의 경우 UTF-8 인코딩으로 저장해주세요.
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">텍스트 직접 입력</h4>
                <p className="text-sm text-gray-600 mb-2">
                  각 줄에 다음 형식으로 입력하세요: 과목, 단원, 평가항목, 학생이름, 점수, 만점
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  예: 수학, 2차 함수, 중간고사, 김철수, 85, 100
                </p>
                <Textarea
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  placeholder="수학, 2차 함수, 중간고사, 김철수, 85, 100
국어, 문학, 수행평가, 이영희, 92, 100
영어, 독해, 단어시험, 박민수, 78, 100"
                  rows={8}
                />
              </div>
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
