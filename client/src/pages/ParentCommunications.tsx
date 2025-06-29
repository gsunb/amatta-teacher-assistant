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
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, MessageSquare, Users, Calendar, Clock, CheckCircle, AlertCircle, Plus, Trash2 } from "lucide-react";
import type { ParentCommunication, InsertParentCommunication, Student } from "@shared/schema";

export default function ParentCommunications() {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newCommunication, setNewCommunication] = useState<InsertParentCommunication>({
    studentName: "",
    communicationType: "phone",
    purpose: "",
    summary: "",
    followUpRequired: false,
    followUpDate: undefined,
    followUpCompleted: false,
    date: new Date().toISOString().split('T')[0],
  });

  // Fetch communications
  const { data: communications = [], isLoading } = useQuery<ParentCommunication[]>({
    queryKey: ["/api/parent-communications"],
  });

  // Fetch students for dropdown
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Create communication mutation
  const createCommunicationMutation = useMutation({
    mutationFn: async (communication: InsertParentCommunication) => {
      return await apiRequest("POST", "/api/parent-communications", communication);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parent-communications"] });
      setIsAdding(false);
      setNewCommunication({
        studentName: "",
        communicationType: "phone",
        purpose: "",
        summary: "",
        followUpRequired: false,
        followUpDate: undefined,
        followUpCompleted: false,
        date: new Date().toISOString().split('T')[0],
      });
      toast({
        title: "성공",
        description: "학부모 소통 기록이 추가되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update follow-up status mutation
  const updateFollowUpMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      return await apiRequest("PATCH", `/api/parent-communications/${id}`, { followUpCompleted: completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parent-communications"] });
      toast({
        title: "성공",
        description: "후속 조치 상태가 업데이트되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete communication mutation
  const deleteCommunicationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/parent-communications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parent-communications"] });
      toast({
        title: "성공",
        description: "소통 기록이 삭제되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!newCommunication.studentName || !newCommunication.purpose || !newCommunication.summary) {
      toast({
        title: "알림",
        description: "필수 정보를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    createCommunicationMutation.mutate(newCommunication);
  };

  const getCommunicationTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'email': return <MessageSquare className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCommunicationTypeLabel = (type: string) => {
    switch (type) {
      case 'phone': return '전화';
      case 'meeting': return '면담';
      case 'email': return '이메일';
      case 'message': return '메시지';
      default: return type;
    }
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
        <h1 className="text-3xl font-bold text-gray-900">학부모 소통 로그</h1>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          소통 기록 추가
        </Button>
      </div>

      {/* Add Communication Form */}
      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>새 소통 기록</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentName">학생 선택 *</Label>
                <Select 
                  value={newCommunication.studentName} 
                  onValueChange={(value) => setNewCommunication({ ...newCommunication, studentName: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="학생을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.length > 0 ? students.map((student) => (
                      <SelectItem key={student.id} value={student.name}>
                        {student.name}
                      </SelectItem>
                    )) : (
                      <SelectItem value="" disabled>
                        등록된 학생이 없습니다
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="communicationType">소통 방식 *</Label>
                <Select 
                  value={newCommunication.communicationType} 
                  onValueChange={(value) => setNewCommunication({ ...newCommunication, communicationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">전화</SelectItem>
                    <SelectItem value="meeting">면담</SelectItem>
                    <SelectItem value="email">이메일</SelectItem>
                    <SelectItem value="message">메시지</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="purpose">소통 목적 *</Label>
                <Input
                  id="purpose"
                  value={newCommunication.purpose}
                  onChange={(e) => setNewCommunication({ ...newCommunication, purpose: e.target.value })}
                  placeholder="예: 학습 상담, 행동 지도, 진로 상담"
                />
              </div>
              <div>
                <Label htmlFor="date">날짜 *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newCommunication.date}
                  onChange={(e) => setNewCommunication({ ...newCommunication, date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="summary">소통 내용 *</Label>
              <Textarea
                id="summary"
                value={newCommunication.summary}
                onChange={(e) => setNewCommunication({ ...newCommunication, summary: e.target.value })}
                placeholder="소통한 내용을 자세히 기록해주세요"
                className="min-h-[100px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="followUpRequired"
                checked={newCommunication.followUpRequired || false}
                onCheckedChange={(checked) => setNewCommunication({ 
                  ...newCommunication, 
                  followUpRequired: !!checked 
                })}
              />
              <Label htmlFor="followUpRequired">후속 조치 필요</Label>
            </div>

            {newCommunication.followUpRequired && (
              <div>
                <Label htmlFor="followUpDate">후속 조치 예정일</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={newCommunication.followUpDate ? new Date(newCommunication.followUpDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => setNewCommunication({ 
                    ...newCommunication, 
                    followUpDate: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                />
              </div>
            )}

            <div className="flex space-x-2">
              <Button onClick={handleSubmit} disabled={createCommunicationMutation.isPending}>
                {createCommunicationMutation.isPending ? "저장 중..." : "저장"}
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Communications List */}
      {communications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">소통 기록이 없습니다</h3>
            <p className="text-gray-500 mb-4">학부모와의 소통 내용을 기록해보세요.</p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              첫 소통 기록 추가
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {communications.map((communication) => (
            <Card key={communication.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        {getCommunicationTypeIcon(communication.communicationType)}
                        <span className="font-medium text-gray-900">{communication.studentName}</span>
                      </div>
                      <Badge variant="outline">
                        {getCommunicationTypeLabel(communication.communicationType)}
                      </Badge>
                      <span className="text-sm text-gray-500">{communication.date}</span>
                    </div>

                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-1">{communication.purpose}</h4>
                      <p className="text-gray-600">{communication.summary}</p>
                    </div>

                    {communication.followUpRequired && (
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-gray-600">
                            후속 조치: {communication.followUpDate ? new Date(communication.followUpDate).toLocaleDateString('ko-KR') : '미정'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={Boolean(communication.followUpCompleted)}
                            onCheckedChange={(checked) => 
                              updateFollowUpMutation.mutate({ 
                                id: communication.id, 
                                completed: Boolean(checked)
                              })
                            }
                          />
                          <span className="text-sm text-gray-600">완료</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCommunicationMutation.mutate(communication.id)}
                    disabled={deleteCommunicationMutation.isPending}
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