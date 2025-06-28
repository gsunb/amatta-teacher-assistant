import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download, BarChart3, TrendingUp, Users, AlertTriangle, UserX, Calendar, FileText } from "lucide-react";
import type { Student, Assessment, Record, Schedule } from "@shared/schema";

export default function Reports() {
  const [reportType, setReportType] = useState<string>("weekly");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("this_week");

  // Fetch all data
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: assessments = [] } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });



  const { data: records = [] } = useQuery<Record[]>({
    queryKey: ["/api/records"],
  });

  const { data: schedules = [] } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules"],
  });

  // Calculate report data
  const generateWeeklyReport = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentAssessments = assessments.filter(a => 
      new Date(a.createdAt || '') > oneWeekAgo
    );
    
    const recentRecords = records.filter(r => 
      new Date(r.date) > oneWeekAgo
    );

    const avgScore = recentAssessments.length > 0 
      ? recentAssessments
          .filter(a => a.score && a.maxScore)
          .reduce((sum, a) => sum + ((a.score! / a.maxScore!) * 100), 0) / 
          recentAssessments.filter(a => a.score && a.maxScore).length
      : 0;

    return {
      totalAssessments: recentAssessments.length,
      averageScore: avgScore,
      totalRecords: recentRecords.length,
      highSeverityRecords: recentRecords.filter(r => r.severity === 'high').length,
      activeStudents: new Set(recentAssessments.map(a => a.studentName)).size,
      period: "지난 7일간"
    };
  };

  const generateMonthlyReport = () => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentAssessments = assessments.filter(a => 
      new Date(a.createdAt || '') > oneMonthAgo
    );
    
    const recentRecords = records.filter(r => 
      new Date(r.date) > oneMonthAgo
    );

    const avgScore = recentAssessments.length > 0 
      ? recentAssessments
          .filter(a => a.score && a.maxScore)
          .reduce((sum, a) => sum + ((a.score! / a.maxScore!) * 100), 0) / 
          recentAssessments.filter(a => a.score && a.maxScore).length
      : 0;

    return {
      totalAssessments: recentAssessments.length,
      averageScore: avgScore,
      totalRecords: recentRecords.length,
      highSeverityRecords: recentRecords.filter(r => r.severity === 'high').length,
      activeStudents: new Set(recentAssessments.map(a => a.studentName)).size,
      period: "지난 30일간"
    };
  };

  const reportData = reportType === "weekly" ? generateWeeklyReport() : generateMonthlyReport();

  const downloadReport = () => {
    const reportContent = `
학급 활동 보고서 - ${reportData.period}
생성일: ${new Date().toLocaleDateString('ko-KR')}

=== 요약 ===
• 총 평가 건수: ${reportData.totalAssessments}개
• 평균 점수: ${reportData.averageScore.toFixed(1)}%
• 사건 기록: ${reportData.totalRecords}건
• 중요 사건: ${reportData.highSeverityRecords}건
• 활동 학생 수: ${reportData.activeStudents}명

=== 상세 데이터 ===

[최근 평가 결과]
${assessments.slice(0, 10).map(a => 
  `• ${a.studentName} - ${a.subject} ${a.unit} (${a.score}/${a.maxScore}점)`
).join('\n')}

[최근 사건 기록]
${records.slice(0, 10).map(r => 
  `• ${r.date} - ${r.title} (${r.severity === 'high' ? '높음' : r.severity === 'medium' ? '보통' : '낮음'})`
).join('\n')}

[학생별 성과 요약]
${students.map(s => {
  const studentAssessments = assessments.filter(a => a.studentName === s.name);
  const avg = studentAssessments.length > 0 
    ? studentAssessments
        .filter(a => a.score && a.maxScore)
        .reduce((sum, a) => sum + ((a.score! / a.maxScore!) * 100), 0) / 
        studentAssessments.filter(a => a.score && a.maxScore).length
    : 0;
  return `• ${s.name}: 평균 ${avg.toFixed(1)}% (${studentAssessments.length}개 평가)`;
}).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `학급보고서_${reportType === 'weekly' ? '주간' : '월간'}_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">학급 통계</h1>
        </div>
        <div className="flex space-x-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">주간 보고서</SelectItem>
              <SelectItem value="monthly">월간 보고서</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" />
            보고서 다운로드
          </Button>
        </div>
      </div>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 평가</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.totalAssessments}개</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">평균 점수</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.averageScore.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">사건 기록</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.totalRecords}건</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">중요 사건</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.highSeverityRecords}건</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활동 학생</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.activeStudents}명</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Alert Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>출결 주의 학생</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const currentYear = new Date().getFullYear();
              const alertStudents = students.map(student => {
                // Check for academic performance issues
                const studentAssessments = assessments.filter(a => a.studentName === student.name);
                const averageScore = studentAssessments.length > 0 
                  ? studentAssessments.reduce((sum, a) => sum + (a.score || 0), 0) / studentAssessments.length 
                  : 0;
                
                // Check for behavioral concerns based on records
                const studentRecords = records.filter(r => 
                  r.studentIds?.includes(student.id) || 
                  r.title.includes(student.name) ||
                  r.description.includes(student.name)
                );
                const severeConcerns = studentRecords.filter(r => r.severity === 'high').length;
                const totalConcerns = studentRecords.length;
                
                const isAcademicAlert = averageScore < 60 && studentAssessments.length > 0;
                const isBehaviorAlert = severeConcerns >= 2 || totalConcerns >= 5;
                
                return { 
                  student, 
                  averageScore,
                  severeConcerns,
                  totalConcerns,
                  isAcademicAlert,
                  isBehaviorAlert,
                  totalIssues: severeConcerns + (isAcademicAlert ? 1 : 0)
                };
              })
              .filter(s => s.isAcademicAlert || s.isBehaviorAlert)
              .sort((a, b) => b.totalIssues - a.totalIssues)
              .slice(0, 10);

              return alertStudents.length > 0 ? (
                <div className="space-y-3">
                  {alertStudents.map((student) => (
                    <div key={student.student.id} className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <UserX className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-gray-900">
                            {student.student.name}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          {student.isAcademicAlert && (
                            <Badge variant="destructive" className="text-xs">
                              성적 주의
                            </Badge>
                          )}
                          {student.isBehaviorAlert && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                              행동 주의
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>평균 성적: {student.averageScore.toFixed(1)}점</div>
                        <div>심각한 문제: {student.severeConcerns}건</div>
                        <div>전체 기록: {student.totalConcerns}건</div>
                        <div>위험도: {student.totalIssues > 2 ? '높음' : student.totalIssues > 0 ? '보통' : '낮음'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">출결 주의 학생이 없습니다.</p>
                  <p className="text-sm text-gray-400">훌륭한 학급 관리입니다!</p>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Recent Issues */}
        <Card>
          <CardHeader>
            <CardTitle>최근 주요 사건</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length > 0 ? (
              <div className="space-y-3">
                {records
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((record) => {
                    const severityColor = 
                      record.severity === 'high' ? 'bg-red-100 text-red-800' :
                      record.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800';

                    return (
                      <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{record.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${severityColor}`}>
                            {record.severity === 'high' ? '높음' : 
                             record.severity === 'medium' ? '보통' : '낮음'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                        <p className="text-xs text-gray-500">{record.date}</p>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">사건 기록이 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance Analysis */}
      {assessments.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>과목별 성과 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
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
                }, {} as { [key: string]: { total: number; count: number; scores: number[] } });

                return Object.entries(subjectStats).map(([subject, stats]) => {
                  const average = stats.total / stats.count;
                  const trend = stats.scores.length > 1 
                    ? stats.scores[stats.scores.length - 1] - stats.scores[0] 
                    : 0;

                  return (
                    <div key={subject} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{subject}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            평균: {average.toFixed(1)}% ({stats.count}개 평가)
                          </span>
                          {trend !== 0 && (
                            <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {trend > 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full"
                          style={{ width: `${Math.min(average, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}