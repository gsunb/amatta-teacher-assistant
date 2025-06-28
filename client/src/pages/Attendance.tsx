import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Clock, AlertTriangle, User, CheckCircle } from "lucide-react";
import type { Attendance, InsertAttendance, Student } from "@shared/schema";

export default function AttendancePage() {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAttendance, setNewAttendance] = useState<InsertAttendance>({
    studentId: 0,
    date: new Date().toISOString().split('T')[0],
    status: "present",
    category: "unexcused",
    reason: "",
    time: "",
    notes: "",
  });

  // Fetch attendance records
  const { data: attendanceRecords = [], isLoading } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance", selectedDate],
  });

  // Fetch students
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Create attendance mutation
  const createAttendanceMutation = useMutation({
    mutationFn: async (attendance: InsertAttendance) => {
      return await apiRequest("POST", "/api/attendance", attendance);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "성공",
        description: "출결 기록이 추가되었습니다.",
      });
      setIsAdding(false);
      setNewAttendance({
        studentId: 0,
        date: new Date().toISOString().split('T')[0],
        status: "present",
        category: "unexcused",
        reason: "",
        time: "",
        notes: "",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "출결 기록 추가에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!newAttendance.studentId || !newAttendance.date || !newAttendance.status) {
      toast({
        title: "오류",
        description: "필수 정보를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    createAttendanceMutation.mutate(newAttendance);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'early_leave': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'field_trip': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return '출석';
      case 'late': return '지각';
      case 'early_leave': return '조퇴';
      case 'absent': return '결석';
      case 'field_trip': return '체험학습';
      default: return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'illness': return '질병';
      case 'unexcused': return '미인정';
      case 'excused': return '출석인정';
      case 'field_trip': return '체험학습';
      default: return category;
    }
  };

  const getFieldTripStats = (studentId: number) => {
    // Calculate field trip usage for the year
    const currentYear = new Date().getFullYear();
    const fieldTripRecords = attendanceRecords.filter(
      record => record.studentId === studentId && 
      record.status === 'field_trip' && 
      new Date(record.date).getFullYear() === currentYear
    );
    return fieldTripRecords.length;
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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">출결 관리</h1>
        </div>
        <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          출결 추가
        </Button>
      </div>

      {/* Date Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>날짜 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Label>날짜</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Attendance Form */}
      {isAdding && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">출결 기록 추가</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>학생 *</Label>
                <Select
                  value={newAttendance.studentId?.toString() || ""}
                  onValueChange={(value) => setNewAttendance({ ...newAttendance, studentId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="학생을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.studentNumber}번 {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>날짜 *</Label>
                <Input
                  type="date"
                  value={newAttendance.date}
                  onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
                />
              </div>

              <div>
                <Label>출결 상태 *</Label>
                <Select
                  value={newAttendance.status}
                  onValueChange={(value: "present" | "late" | "early_leave" | "absent" | "field_trip") => 
                    setNewAttendance({ ...newAttendance, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">출석</SelectItem>
                    <SelectItem value="late">지각</SelectItem>
                    <SelectItem value="early_leave">조퇴</SelectItem>
                    <SelectItem value="absent">결석</SelectItem>
                    <SelectItem value="field_trip">체험학습</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>분류 *</Label>
                <Select
                  value={newAttendance.category || "unexcused"}
                  onValueChange={(value: "illness" | "unexcused" | "excused" | "field_trip") => 
                    setNewAttendance({ ...newAttendance, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="illness">질병</SelectItem>
                    <SelectItem value="unexcused">미인정</SelectItem>
                    <SelectItem value="excused">출석인정</SelectItem>
                    <SelectItem value="field_trip">체험학습</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(newAttendance.status === 'late' || newAttendance.status === 'early_leave') && (
                <div>
                  <Label>시간</Label>
                  <Input
                    type="time"
                    value={newAttendance.time || ""}
                    onChange={(e) => setNewAttendance({ ...newAttendance, time: e.target.value })}
                    placeholder="HH:MM"
                  />
                </div>
              )}

              <div>
                <Label>사유</Label>
                <Input
                  value={newAttendance.reason || ""}
                  onChange={(e) => setNewAttendance({ ...newAttendance, reason: e.target.value })}
                  placeholder="출결 사유를 입력하세요"
                />
              </div>

              <div className="md:col-span-2">
                <Label>비고</Label>
                <Input
                  value={newAttendance.notes || ""}
                  onChange={(e) => setNewAttendance({ ...newAttendance, notes: e.target.value })}
                  placeholder="추가 메모가 있다면 입력하세요"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={createAttendanceMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createAttendanceMutation.isPending ? "추가 중..." : "출결 추가"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAdding(false)}
              >
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Records */}
      <div className="space-y-4">
        {attendanceRecords.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedDate}의 출결 기록이 없습니다
              </h3>
              <p className="text-gray-500 mb-4">첫 번째 출결 기록을 추가해보세요.</p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                출결 추가
              </Button>
            </CardContent>
          </Card>
        ) : (
          attendanceRecords.map((record) => {
            const student = students.find(s => s.id === record.studentId);
            const fieldTripCount = getFieldTripStats(record.studentId);
            
            return (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <User className="h-5 w-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {student ? `${student.studentNumber}번 ${student.name}` : '학생 정보 없음'}
                        </h3>
                        <Badge className={getStatusColor(record.status)}>
                          {getStatusLabel(record.status)}
                        </Badge>
                        <Badge variant="outline">
                          {getCategoryLabel(record.category || "unexcused")}
                        </Badge>
                      </div>

                      {record.reason && (
                        <p className="text-gray-600 mb-2">
                          <span className="font-medium">사유:</span> {record.reason}
                        </p>
                      )}

                      {record.time && (
                        <p className="text-gray-600 mb-2">
                          <Clock className="h-4 w-4 inline mr-1" />
                          <span className="font-medium">시간:</span> {record.time}
                        </p>
                      )}

                      {record.notes && (
                        <p className="text-gray-600 mb-2">
                          <span className="font-medium">비고:</span> {record.notes}
                        </p>
                      )}

                      {record.status === 'field_trip' && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            올해 체험학습: {fieldTripCount}/19일
                          </Badge>
                          {fieldTripCount >= 17 && (
                            <Badge variant="destructive" className="flex items-center space-x-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>주의</span>
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </main>
  );
}