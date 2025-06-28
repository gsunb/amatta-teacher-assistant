import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Trash2, AlertTriangle, User, AlertCircle, Shield, Edit2 } from "lucide-react";
import type { Record, InsertRecord, Student } from "@shared/schema";

export default function Records() {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [newRecord, setNewRecord] = useState<InsertRecord>({
    title: "",
    description: "",
    date: "",
    severity: "medium",
    studentId: undefined,
  });

  // Fetch records
  const { data: records = [], isLoading } = useQuery<Record[]>({
    queryKey: ["/api/records"],
  });

  // Fetch students for dropdown
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Create record mutation
  const createRecordMutation = useMutation({
    mutationFn: async (record: InsertRecord) => {
      return await apiRequest("POST", "/api/records", record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
      toast({
        title: "성공",
        description: "기록이 추가되었습니다.",
      });
      setIsAdding(false);
      setNewRecord({
        title: "",
        description: "",
        date: "",
        severity: "medium",
        studentId: undefined,
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "기록 추가에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Update record mutation
  const updateRecordMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertRecord> }) => {
      return await apiRequest("PATCH", `/api/records/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
      toast({
        title: "성공",
        description: "기록이 수정되었습니다.",
      });
      setEditingRecord(null);
    },
    onError: () => {
      toast({
        title: "오류",
        description: "기록 수정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Delete record mutation
  const deleteRecordMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/records/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
      toast({
        title: "성공",
        description: "기록이 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "기록 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!newRecord.title || !newRecord.description || !newRecord.date) {
      toast({
        title: "알림",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    createRecordMutation.mutate(newRecord);
  };

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
  };

  const handleUpdateSubmit = () => {
    if (!editingRecord) return;
    updateRecordMutation.mutate({
      id: editingRecord.id,
      data: {
        title: editingRecord.title,
        description: editingRecord.description,
        date: editingRecord.date,
        severity: editingRecord.severity,
        studentId: editingRecord.studentId,
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-300';
    }
  };

  const getSeverityLabel = (severity: string | null) => {
    switch (severity) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '보통';
    }
  };

  const getSeverityIcon = (severity: string | null) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <Shield className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStudentName = (studentId: number | null) => {
    if (!studentId) return "학생 미지정";
    const student = students.find(s => s.id === studentId);
    return student ? `${student.studentNumber}번 ${student.name}` : "학생 미지정";
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
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">누가 기록</h1>
        </div>
        <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          기록 추가
        </Button>
      </div>

      <div className="space-y-6">
        {isAdding && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">새 기록 추가</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>제목 *</Label>
                <Input
                  placeholder="기록 제목을 입력하세요"
                  value={newRecord.title}
                  onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                />
              </div>

              <div>
                <Label>관련 학생</Label>
                <Select
                  value={newRecord.studentId?.toString() || "none"}
                  onValueChange={(value) => 
                    setNewRecord({ ...newRecord, studentId: value === "none" ? undefined : parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="학생을 선택하세요 (선택사항)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">학생 미지정</SelectItem>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.studentNumber}번 {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>상세 내용 *</Label>
                <Textarea
                  placeholder="상세 내용을 입력하세요"
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label>날짜 *</Label>
                <Input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                />
              </div>

              <div>
                <Label>중요도</Label>
                <Select
                  value={newRecord.severity || "medium"}
                  onValueChange={(value: "low" | "medium" | "high") => 
                    setNewRecord({ ...newRecord, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">낮음</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="high">높음</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={createRecordMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createRecordMutation.isPending ? "추가 중..." : "기록 추가"}
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

        {editingRecord && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">기록 수정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>제목 *</Label>
                <Input
                  value={editingRecord.title}
                  onChange={(e) => setEditingRecord({ ...editingRecord, title: e.target.value })}
                />
              </div>

              <div>
                <Label>관련 학생</Label>
                <Select
                  value={editingRecord.studentId?.toString() || "none"}
                  onValueChange={(value) => 
                    setEditingRecord({ ...editingRecord, studentId: value === "none" ? null : parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">학생 미지정</SelectItem>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.studentNumber}번 {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>상세 내용 *</Label>
                <Textarea
                  value={editingRecord.description}
                  onChange={(e) => setEditingRecord({ ...editingRecord, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label>날짜 *</Label>
                <Input
                  type="date"
                  value={editingRecord.date}
                  onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                />
              </div>

              <div>
                <Label>중요도</Label>
                <Select
                  value={editingRecord.severity || "medium"}
                  onValueChange={(value: "low" | "medium" | "high") => 
                    setEditingRecord({ ...editingRecord, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">낮음</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="high">높음</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleUpdateSubmit}
                  disabled={updateRecordMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateRecordMutation.isPending ? "수정 중..." : "수정 완료"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingRecord(null)}
                >
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {records.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">기록이 없습니다</h3>
              <p className="text-gray-500 mb-4">첫 번째 기록을 추가해보세요.</p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                기록 추가
              </Button>
            </CardContent>
          </Card>
        ) : (
          records.map((record) => (
            <Card key={record.id} className={`hover:shadow-md transition-shadow border-l-4 ${getSeverityColor(record.severity || "medium")}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {record.title}
                      </h3>
                      <Badge 
                        variant="secondary" 
                        className={`flex items-center space-x-1 ${
                          record.severity === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                          record.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }`}
                      >
                        {getSeverityIcon(record.severity)}
                        <span>{getSeverityLabel(record.severity)}</span>
                      </Badge>
                    </div>
                    
                    {record.studentId && (
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {getStudentName(record.studentId)}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-gray-600 mb-3">
                      {record.description}
                    </p>
                    
                    <p className="text-sm text-gray-500">
                      {formatDate(record.date)}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(record)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRecordMutation.mutate(record.id)}
                      disabled={deleteRecordMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}