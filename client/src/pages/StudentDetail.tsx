import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, BarChart, AlertTriangle, Calendar, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import type { Student, Assessment, Record, Schedule } from "@shared/schema";

export default function StudentDetail() {
  const [match, params] = useRoute("/students/:studentName");
  const studentName = decodeURIComponent(params?.studentName || "");

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

  // Find the specific student
  const student = students.find(s => s.name === studentName);

  // Filter data for this student
  const studentAssessments = assessments.filter(a => a.studentName === studentName);
  const studentRecords = records.filter(r => 
    r.title.includes(studentName) || r.description?.includes(studentName)
  );
  const studentSchedules = schedules.filter(s => 
    s.title.includes(studentName) || s.description?.includes(studentName)
  );

  // Calculate student statistics
  const totalAssessments = studentAssessments.length;
  const averageScore = totalAssessments > 0 
    ? studentAssessments
        .filter(a => a.score && a.maxScore)
        .reduce((sum, a) => sum + ((a.score! / a.maxScore!) * 100), 0) / 
        studentAssessments.filter(a => a.score && a.maxScore).length
    : 0;

  const recentRecords = studentRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (!student) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">학생을 찾을 수 없습니다</h1>
          <Link href="/students">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              학생 목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/students">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-gray-600">
              {student.grade && student.class 
                ? `${student.grade}학년 ${student.class}반` 
                : '학급 정보 없음'
              }
              {student.studentNumber && ` • 학번: ${student.studentNumber}`}
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 평가</p>
                <p className="text-2xl font-bold text-gray-900">{totalAssessments}개</p>
              </div>
              <BarChart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">평균 점수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {averageScore > 0 ? `${averageScore.toFixed(1)}%` : '-'}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">{studentRecords.length}건</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">관련 일정</p>
                <p className="text-2xl font-bold text-gray-900">{studentSchedules.length}개</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Assessments */}
        <Card>
          <CardHeader>
            <CardTitle>최근 성과 평가</CardTitle>
          </CardHeader>
          <CardContent>
            {studentAssessments.length > 0 ? (
              <div className="space-y-4">
                {studentAssessments
                  .sort((a, b) => b.id - a.id)
                  .slice(0, 5)
                  .map((assessment) => {
                    const percentage = assessment.score && assessment.maxScore 
                      ? (assessment.score / assessment.maxScore) * 100 
                      : 0;
                    
                    const performanceColor = 
                      percentage >= 90 ? 'bg-green-100 text-green-800' :
                      percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                      percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800';

                    return (
                      <div key={assessment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {assessment.subject} - {assessment.unit}
                          </p>
                          <p className="text-sm text-gray-600">{assessment.task}</p>
                          {assessment.notes && (
                            <p className="text-sm text-gray-500 mt-1">{assessment.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={performanceColor}>
                            {assessment.score}/{assessment.maxScore}
                          </Badge>
                          {percentage > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              {percentage.toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">평가 기록이 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Records */}
        <Card>
          <CardHeader>
            <CardTitle>최근 사건 기록</CardTitle>
          </CardHeader>
          <CardContent>
            {recentRecords.length > 0 ? (
              <div className="space-y-4">
                {recentRecords.map((record) => {
                  const severityColor = 
                    record.severity === 'high' ? 'bg-red-100 text-red-800' :
                    record.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800';

                  return (
                    <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{record.title}</h4>
                        <Badge className={severityColor}>
                          {record.severity === 'high' ? '높음' : 
                           record.severity === 'medium' ? '보통' : '낮음'}
                        </Badge>
                      </div>
                      {record.description && (
                        <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                      )}
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

      {/* Performance by Subject */}
      {studentAssessments.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>과목별 성과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const subjectStats = studentAssessments.reduce((acc, assessment) => {
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
                
                return Object.entries(subjectStats);
              })().map(([subject, stats]) => {
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
                        className="bg-primary h-3 rounded-full"
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
    </main>
  );
}