import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Trash2, Upload, FileText, Download, FileSpreadsheet } from "lucide-react";
import { Link } from "wouter";
import * as XLSX from 'xlsx';
import type { Student, InsertStudent } from "@shared/schema";

export default function Students() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadText, setUploadText] = useState("");
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
    mutationFn: async (text: string) => {
      const lines = text.trim().split('\n').filter(line => line.trim());
      const items: InsertStudent[] = [];

      for (const line of lines) {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length >= 1 && parts[0]) {
          items.push({
            name: parts[0],
            studentNumber: parts[1] || null,
            grade: parts[2] || null,
            class: parts[3] || null,
          });
        }
      }

      return await apiRequest("POST", "/api/students/upload", items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setIsUploading(false);
      setUploadText("");
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
    // Create simple Excel template for students
    const templateData = [
      ['학년', '반', '번호', '이름', '성별'],
      ['1', 'A', '1', '김철수', '남'],
      ['1', 'B', '2', '이영희', '여'],
      ['2', 'A', '3', '박민수', '남'],
      ['2', 'B', '4', '정수현', '남'],
      ['3', 'A', '5', '한지원', '여']
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    
    // Set column widths for better display
    ws['!cols'] = [
      { wch: 8 },  // 학년
      { wch: 8 },  // 반
      { wch: 8 },  // 번호
      { wch: 12 }, // 이름
      { wch: 8 }   // 성별
    ];

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, '학생명단');
    
    // Generate Excel file
    XLSX.writeFile(wb, '학생명단_템플릿.xlsx');

    toast({
      title: "다운로드 완료",
      description: "Excel 템플릿이 다운로드되었습니다. 5개 열: 학년, 반, 번호, 이름, 성별",
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
        const students: InsertStudent[] = [];

        for (const row of dataRows) {
          if (row.length >= 1 && row[0]) {
            students.push({
              name: String(row[0] || '').trim(),
              studentNumber: row[1] ? String(row[1]).trim() : null,
              grade: row[2] ? String(row[2]).trim() : null,
              class: row[3] ? String(row[3]).trim() : null,
            });
          }
        }

        if (students.length > 0) {
          // Convert to text format for existing upload function
          const textData = students.map(s => 
            `${s.name}, ${s.studentNumber || ''}, ${s.grade || ''}, ${s.class || ''}`
          ).join('\n');
          
          setUploadText(textData);
          uploadStudentsMutation.mutate(textData);
          
          toast({
            title: "업로드 성공",
            description: `${students.length}명의 학생 데이터가 업로드되었습니다.`,
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
    uploadStudentsMutation.mutate(uploadText);
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
            onClick={() => setIsUploading(!isUploading)}
          >
            <Upload className="h-4 w-4 mr-2" />
            일괄 업로드
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
        accept=".xlsx,.xls,.csv"
        onChange={handleExcelUpload}
        style={{ display: 'none' }}
      />

      {/* Upload Form */}
      {isUploading && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>학생 명단 업로드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Excel Upload Section */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Excel 파일 업로드</h4>
                <div className="flex items-center space-x-4">
                  <Input
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
                  <br />템플릿을 다운로드하여 형식을 확인하세요.
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">텍스트 직접 입력</h4>
                <p className="text-sm text-gray-600 mb-2">
                  각 줄에 다음 형식으로 입력하세요: 이름, 학번, 학년, 반
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  예: 김철수, 20240001, 1, A
                </p>
                <Textarea
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  placeholder="김철수, 20240001, 1, A
이영희, 20240002, 1, B
박민수, 20240003, 2, A"
                  rows={8}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleUpload}
                disabled={uploadStudentsMutation.isPending}
              >
                {uploadStudentsMutation.isPending ? "업로드 중..." : "업로드"}
              </Button>
              <Button variant="outline" onClick={() => setIsUploading(false)}>
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                  placeholder="학생 이름"
                />
              </div>
              <div>
                <Label htmlFor="studentNumber">학번</Label>
                <Input
                  id="studentNumber"
                  value={newStudent.studentNumber || ""}
                  onChange={(e) => setNewStudent({ ...newStudent, studentNumber: e.target.value })}
                  placeholder="20240001"
                />
              </div>
              <div>
                <Label htmlFor="grade">학년</Label>
                <Input
                  id="grade"
                  value={newStudent.grade || ""}
                  onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="class">반</Label>
                <Input
                  id="class"
                  value={newStudent.class || ""}
                  onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                  placeholder="A"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSubmit} disabled={createStudentMutation.isPending}>
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
      {students.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">학생이 없습니다</h3>
            <p className="text-gray-500 mb-4">새 학생을 추가하거나 파일을 업로드해보세요.</p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              첫 학생 추가
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <Card key={student.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/students/${encodeURIComponent(student.name)}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-primary cursor-pointer">
                        {student.name}
                      </h3>
                    </Link>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
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
    </main>
  );
}