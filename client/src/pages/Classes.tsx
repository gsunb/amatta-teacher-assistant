import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  Download,
  UserPlus,
  GraduationCap,
  Calendar
} from "lucide-react";
import type { Class, InsertClass, Student, InsertStudent } from "@shared/schema";
import * as XLSX from "xlsx";

export default function Classes() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newClass, setNewClass] = useState<InsertClass>({
    grade: "",
    className: "",
    year: new Date().getFullYear().toString(),
  });
  const [newStudent, setNewStudent] = useState<InsertStudent>({
    classId: 0,
    studentNumber: "",
    name: "",
  });

  // Fetch classes
  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  // Fetch students for selected class
  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students", selectedClass?.id],
    enabled: !!selectedClass?.id,
  });

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (classData: InsertClass) => {
      return await apiRequest("POST", "/api/classes", classData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "성공",
        description: "학급이 추가되었습니다.",
      });
      setIsAddingClass(false);
      setNewClass({
        grade: "",
        className: "",
        year: new Date().getFullYear().toString(),
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "학급 추가에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (student: InsertStudent) => {
      return await apiRequest("POST", "/api/students", student);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", selectedClass?.id] });
      toast({
        title: "성공",
        description: "학생이 추가되었습니다.",
      });
      setIsAddingStudent(false);
      setNewStudent({
        classId: selectedClass?.id || 0,
        studentNumber: "",
        name: "",
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

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      setSelectedClass(null);
      toast({
        title: "성공",
        description: "학급이 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "학급 삭제에 실패했습니다.",
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
      queryClient.invalidateQueries({ queryKey: ["/api/students", selectedClass?.id] });
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

  // Upload students mutation
  const uploadStudentsMutation = useMutation({
    mutationFn: async (studentsData: string) => {
      return await apiRequest("POST", "/api/students/upload", { data: studentsData, classId: selectedClass?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", selectedClass?.id] });
      toast({
        title: "성공",
        description: "학생 목록이 업로드되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "학생 목록 업로드에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleCreateClass = () => {
    if (!newClass.grade || !newClass.className) {
      toast({
        title: "알림",
        description: "학년과 반은 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }
    createClassMutation.mutate(newClass);
  };

  const handleCreateStudent = () => {
    if (!newStudent.name || !newStudent.studentNumber) {
      toast({
        title: "알림",
        description: "이름과 번호는 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }
    createStudentMutation.mutate({ ...newStudent, classId: selectedClass?.id || 0 });
  };

  const downloadTemplate = () => {
    const templateData = [
      ['번호', '이름'],
      ['1', '김철수'],
      ['2', '이영희'],
      ['3', '박민수'],
      ['4', '정수현'],
      ['5', '한지원']
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    
    ws['!cols'] = [
      { wch: 8 },  // 번호
      { wch: 12 }, // 이름
    ];

    XLSX.utils.book_append_sheet(wb, ws, '학생명단');
    XLSX.writeFile(wb, `${selectedClass?.grade}학년_${selectedClass?.className}반_학생명단_템플릿.xlsx`);

    toast({
      title: "다운로드 완료",
      description: "Excel 템플릿이 다운로드되었습니다.",
    });
  };

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        const dataRows = rows.slice(1);
        const studentsText = dataRows
          .filter(row => row.length >= 2 && row[1])
          .map(row => `${row[1]}, ${row[0]}`)
          .join('\n');

        uploadStudentsMutation.mutate(studentsText);
      } catch (error) {
        toast({
          title: "오류",
          description: "Excel 파일을 읽는데 실패했습니다.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  if (classesLoading) {
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
        <h1 className="text-3xl font-bold text-gray-900">학급 관리</h1>
        <Button onClick={() => setIsAddingClass(true)}>
          <Plus className="h-4 w-4 mr-2" />
          학급 추가
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>학급 목록</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">등록된 학급이 없습니다.</p>
                  <Button onClick={() => setIsAddingClass(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    첫 학급 추가
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {classes.map((classItem) => (
                    <div
                      key={classItem.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedClass?.id === classItem.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedClass(classItem)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{classItem.grade}학년 {classItem.className}반</h3>
                          <p className="text-sm text-gray-500">{classItem.year}년도</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>학급 삭제</AlertDialogTitle>
                                <AlertDialogDescription>
                                  이 학급과 소속된 모든 학생 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteClassMutation.mutate(classItem.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Student Management */}
        <div className="lg:col-span-2">
          {selectedClass ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>{selectedClass.grade} {selectedClass.className}반 학생 관리</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      템플릿 다운로드
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('excel-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Excel 업로드
                    </Button>
                    <input
                      id="excel-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleExcelUpload}
                      className="hidden"
                    />
                    <Button size="sm" onClick={() => setIsAddingStudent(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      학생 추가
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">등록된 학생이 없습니다.</p>
                    <Button onClick={() => setIsAddingStudent(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      첫 학생 추가
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-gray-500">번호: {student.studentNumber}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>학생 삭제</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {student.name} 학생의 모든 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteStudentMutation.mutate(student.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">학급을 선택하세요</h3>
                <p className="text-gray-500">좌측에서 학급을 선택하면 해당 학급의 학생들을 관리할 수 있습니다.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Class Dialog */}
      <Dialog open={isAddingClass} onOpenChange={setIsAddingClass}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 학급 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">학년 *</Label>
                <Select
                  value={newClass.grade}
                  onValueChange={(value) => setNewClass({ ...newClass, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="학년 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1학년</SelectItem>
                    <SelectItem value="2">2학년</SelectItem>
                    <SelectItem value="3">3학년</SelectItem>
                    <SelectItem value="4">4학년</SelectItem>
                    <SelectItem value="5">5학년</SelectItem>
                    <SelectItem value="6">6학년</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="className">반 *</Label>
                <Input
                  id="className"
                  value={newClass.className}
                  onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                  placeholder="예: A, 1, 가"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="year">연도</Label>
              <Input
                id="year"
                value={newClass.year}
                onChange={(e) => setNewClass({ ...newClass, year: e.target.value })}
                placeholder="2024"
              />
            </div>
            <div className="flex space-x-2 pt-4">
              <Button
                onClick={handleCreateClass}
                disabled={createClassMutation.isPending}
                className="flex-1"
              >
                {createClassMutation.isPending ? "추가 중..." : "추가"}
              </Button>
              <Button variant="outline" onClick={() => setIsAddingClass(false)} className="flex-1">
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 학생 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="studentNumber">번호 *</Label>
              <Input
                id="studentNumber"
                value={newStudent.studentNumber}
                onChange={(e) => setNewStudent({ ...newStudent, studentNumber: e.target.value })}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="studentName">이름 *</Label>
              <Input
                id="studentName"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                placeholder="김철수"
              />
            </div>
            <div className="flex space-x-2 pt-4">
              <Button
                onClick={handleCreateStudent}
                disabled={createStudentMutation.isPending}
                className="flex-1"
              >
                {createStudentMutation.isPending ? "추가 중..." : "추가"}
              </Button>
              <Button variant="outline" onClick={() => setIsAddingStudent(false)} className="flex-1">
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}