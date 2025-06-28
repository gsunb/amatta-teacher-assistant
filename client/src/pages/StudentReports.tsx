import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, BookOpen, Calendar, MessageSquare, FileText } from "lucide-react";
import type { Student, Assessment, Schedule, Record, ParentCommunication } from "@shared/schema";

export default function StudentReports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch all data
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: assessments = [] } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });

  const { data: schedules = [] } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules"],
  });

  const { data: records = [] } = useQuery<Record[]>({
    queryKey: ["/api/records"],
  });

  const { data: parentCommunications = [] } = useQuery<ParentCommunication[]>({
    queryKey: ["/api/parent-communications"],
  });

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentNumber.includes(searchQuery)
  );

  // Get data for selected student
  const getStudentData = (student: Student) => {
    const studentAssessments = assessments.filter(a => a.studentName === student.name);
    const studentSchedules = schedules.filter(s => 
      s.title.includes(student.name) || s.description?.includes(student.name)
    );
    const studentRecords = records.filter(r => 
      r.studentIds?.includes(student.id)
    );
    const studentCommunications = parentCommunications.filter(pc => 
      pc.studentName === student.name
    );

    return {
      assessments: studentAssessments,
      schedules: studentSchedules,
      records: studentRecords,
      communications: studentCommunications
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getGradeAverage = (assessments: Assessment[]) => {
    const validScores = assessments.filter(a => a.score && a.maxScore);
    if (validScores.length === 0) return 0;
    
    const average = validScores.reduce((sum, a) => {
      return sum + ((a.score! / a.maxScore!) * 100);
    }, 0) / validScores.length;
    
    return Math.round(average * 10) / 10;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">학생 종합 보고서</h1>
            <p className="mt-2 text-gray-600">학생별 성적, 일정, 기록, 상담 내역을 종합적으로 확인할 수 있습니다.</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>학생 검색</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="학생 이름 또는 번호로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => setSearchQuery("")}
                variant="outline"
              >
                초기화
              </Button>
            </div>

            {/* Student List */}
            {searchQuery && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">검색 결과</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedStudent?.id === student.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{student.studentNumber}번</span>
                        <span>{student.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredStudents.length === 0 && (
                  <p className="text-gray-500 text-center py-4">검색 결과가 없습니다.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Report */}
        {selectedStudent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{selectedStudent.studentNumber}번 {selectedStudent.name} 종합 보고서</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">개요</TabsTrigger>
                  <TabsTrigger value="assessments">성적</TabsTrigger>
                  <TabsTrigger value="schedules">일정</TabsTrigger>
                  <TabsTrigger value="records">기록</TabsTrigger>
                  <TabsTrigger value="communications">상담</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {(() => {
                    const data = getStudentData(selectedStudent);
                    const gradeAverage = getGradeAverage(data.assessments);
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="text-sm text-gray-600">평균 성적</p>
                                <p className="text-2xl font-bold text-blue-600">{gradeAverage}%</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-5 w-5 text-green-500" />
                              <div>
                                <p className="text-sm text-gray-600">관련 일정</p>
                                <p className="text-2xl font-bold text-green-600">{data.schedules.length}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-5 w-5 text-orange-500" />
                              <div>
                                <p className="text-sm text-gray-600">누가 기록</p>
                                <p className="text-2xl font-bold text-orange-600">{data.records.length}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-5 w-5 text-purple-500" />
                              <div>
                                <p className="text-sm text-gray-600">학부모 상담</p>
                                <p className="text-2xl font-bold text-purple-600">{data.communications.length}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="assessments" className="space-y-4">
                  {(() => {
                    const data = getStudentData(selectedStudent);
                    return data.assessments.length > 0 ? (
                      <div className="space-y-3">
                        {data.assessments.map((assessment) => (
                          <Card key={assessment.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{assessment.subject} - {assessment.unit}</h3>
                                  <p className="text-sm text-gray-600">{assessment.task}</p>
                                  {assessment.notes && (
                                    <p className="text-sm text-gray-500 mt-1">{assessment.notes}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  {assessment.score && assessment.maxScore && (
                                    <div>
                                      <Badge variant="secondary" className="mb-1">
                                        {assessment.score}/{assessment.maxScore}
                                      </Badge>
                                      <p className="text-sm text-gray-600">
                                        {Math.round((assessment.score / assessment.maxScore) * 100)}%
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">성적 기록이 없습니다.</p>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="schedules" className="space-y-4">
                  {(() => {
                    const data = getStudentData(selectedStudent);
                    return data.schedules.length > 0 ? (
                      <div className="space-y-3">
                        {data.schedules.map((schedule) => (
                          <Card key={schedule.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{schedule.title}</h3>
                                  {schedule.description && (
                                    <p className="text-sm text-gray-600">{schedule.description}</p>
                                  )}
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                  <p>{formatDate(schedule.date)}</p>
                                  {schedule.time && <p>{schedule.time}</p>}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">관련 일정이 없습니다.</p>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="records" className="space-y-4">
                  {(() => {
                    const data = getStudentData(selectedStudent);
                    return data.records.length > 0 ? (
                      <div className="space-y-3">
                        {data.records.map((record) => (
                          <Card key={record.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-medium">{record.title}</h3>
                                    <Badge variant={
                                      record.severity === 'high' ? 'destructive' :
                                      record.severity === 'medium' ? 'secondary' : 'outline'
                                    }>
                                      {record.severity === 'high' ? '높음' :
                                       record.severity === 'medium' ? '보통' : '낮음'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">{record.description}</p>
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                  <p>{formatDate(record.date)}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">누가 기록이 없습니다.</p>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="communications" className="space-y-4">
                  {(() => {
                    const data = getStudentData(selectedStudent);
                    return data.communications.length > 0 ? (
                      <div className="space-y-3">
                        {data.communications.map((comm) => (
                          <Card key={comm.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-medium">{comm.communicationType}</h3>
                                    <Badge variant={comm.completed ? "default" : "secondary"}>
                                      {comm.completed ? "완료" : "예정"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">
                                    <strong>목적:</strong> {comm.purpose}
                                  </p>
                                  {comm.outcome && (
                                    <p className="text-sm text-gray-600">
                                      <strong>결과:</strong> {comm.outcome}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                  <p>{formatDate(comm.date)}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">학부모 상담 기록이 없습니다.</p>
                    );
                  })()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {!selectedStudent && !searchQuery && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">학생을 검색해주세요</h3>
              <p className="text-gray-500">학생 이름이나 번호를 입력하여 종합 보고서를 확인할 수 있습니다.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}