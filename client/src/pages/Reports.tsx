import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download, FileText, TrendingUp, Users, AlertTriangle } from "lucide-react";
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
        <h1 className="text-3xl font-bold text-gray-900">학급 보고서</h1>
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
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>우수 학생 ({reportData.period})</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const studentPerformance = students.map(student => {
                const studentAssessments = assessments.filter(a => a.studentName === student.name);
                const avgScore = studentAssessments.length > 0 
                  ? studentAssessments
                      .filter(a => a.score && a.maxScore)
                      .reduce((sum, a) => sum + ((a.score! / a.maxScore!) * 100), 0) / 
                      studentAssessments.filter(a => a.score && a.maxScore).length
                  : 0;
                return { student, avgScore, assessmentCount: studentAssessments.length };
              })
              .filter(p => p.assessmentCount > 0)
              .sort((a, b) => b.avgScore - a.avgScore)
              .slice(0, 5);

              return studentPerformance.length > 0 ? (
                <div className="space-y-3">
                  {studentPerformance.map((perf, index) => (
                    <div key={perf.student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-primary">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-gray-900">{perf.student.name}</p>
                          <p className="text-sm text-gray-600">{perf.assessmentCount}개 평가</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {perf.avgScore.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">평가 데이터가 없습니다.</p>
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