import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Trash2, Upload, FileText, Download } from "lucide-react";
import type { Student, InsertStudent } from "@shared/schema";

export default function Students() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newStudent, setNewStudent] = useState<InsertStudent>({
    name: "",
    studentNumber: "",
    grade: "",
    class: "",
  });

  // Fetch students
  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (student: InsertStudent) => {
      return await apiRequest("POST", "/api/students", student);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "성공",
        description: "학생이 추가되었습니다.",
      });
      setIsAdding(false);
      setNewStudent({
        name: "",
        studentNumber: "",
        grade: "",
        class: "",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "학생 추가에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Upload students mutation
  const uploadStudentsMutation = useMutation({
    mutationFn: async (students: InsertStudent[]) => {
      return await apiRequest("POST", "/api/students", { students });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "성공",
        description: "학생 명단이 업로드되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "학생 명단 업로드에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "성공",
        description: "학생이 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "학생 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!newStudent.name) {
      toast({
        title: "알림",
        description: "학생 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    createStudentMutation.mutate(newStudent);
  };

  const downloadTemplate = () => {
    const csvContent = "이름,학번,학년,반\n김철수,20240001,1,A\n이영희,20240002,1,B\n박민수,20240003,2,A";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "학생명단_템플릿.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "다운로드 완료",
      description: "학생 명단 템플릿이 다운로드되었습니다.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const students: InsertStudent[] = [];

        lines.forEach((line, index) => {
          if (index === 0 && (line.includes('이름') || line.includes('name'))) {
            // Skip header row
            return;
          }

          const columns = line.split(',').map(col => col.trim());
          if (columns[0]) {
            students.push({
              name: columns[0],
              studentNumber: columns[1] || "",
              grade: columns[2] || "",
              class: columns[3] || "",
            });
          }
        });

        if (students.length > 0) {
          uploadStudentsMutation.mutate(students);
        } else {
          toast({
            title: "오류",
            description: "유효한 학생 데이터를 찾을 수 없습니다.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "오류",
          description: "파일 읽기에 실패했습니다.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
    event.target.value = "";
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
        <h1 className="text-3xl font-bold text-gray-900">학생 명단</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
          >
            <Download className="h-4 w-4 mr-2" />
            템플릿 다운로드
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadStudentsMutation.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            파일 업로드
          </Button>
          <Button onClick={() => setIsAdding(!isAdding)}>
            <Plus className="h-4 w-4 mr-2" />
            학생 추가
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* File Upload Instructions */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">CSV 파일 업로드 안내</p>
              <p className="text-xs text-blue-600 mt-1">
                CSV 파일의 첫 번째 열에 학생 이름을 입력하세요. 
                선택사항: 학번(2열), 학년(3열), 반(4열)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Student Form */}
      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>새 학생 추가</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="예: 김철수"
                />
              </div>
              <div>
                <Label htmlFor="studentNumber">학번</Label>
                <Input
                  id="studentNumber"
                  value={newStudent.studentNumber || ""}
                  onChange={(e) => setNewStudent({ ...newStudent, studentNumber: e.target.value || undefined })}
                  placeholder="예: 2024001"
                />
              </div>
              <div>
                <Label htmlFor="grade">학년</Label>
                <Input
                  id="grade"
                  value={newStudent.grade || ""}
                  onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value || undefined })}
                  placeholder="예: 3학년"
                />
              </div>
              <div>
                <Label htmlFor="class">반</Label>
                <Input
                  id="class"
                  value={newStudent.class || ""}
                  onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value || undefined })}
                  placeholder="예: 2반"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleSubmit}
                disabled={createStudentMutation.isPending}
              >
                {createStudentMutation.isPending ? "추가 중..." : "추가"}
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students List */}
      <div className="space-y-4">
        {students.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">학생이 없습니다</h3>
              <p className="text-gray-500 mb-4">학생을 추가하거나 CSV 파일을 업로드해보세요.</p>
              <div className="flex justify-center space-x-2">
                <Button onClick={() => setIsAdding(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  학생 추가
                </Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  파일 업로드
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {student.name}
                      </h3>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        {student.studentNumber && (
                          <p>학번: {student.studentNumber}</p>
                        )}
                        {student.grade && (
                          <p>학년: {student.grade}</p>
                        )}
                        {student.class && (
                          <p>반: {student.class}</p>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteStudentMutation.mutate(student.id)}
                      disabled={deleteStudentMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {students.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          총 {students.length}명의 학생이 등록되어 있습니다.
        </div>
      )}
    </main>
  );
}
