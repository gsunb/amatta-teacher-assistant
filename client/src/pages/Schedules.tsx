import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import type { Schedule, InsertSchedule } from "@shared/schema";

export default function Schedules() {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newSchedule, setNewSchedule] = useState<InsertSchedule>({
    title: "",
    date: "",
    time: "",
    endTime: "",
    description: "",
  });

  // Fetch schedules
  const { data: schedules = [], isLoading } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules"],
  });

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (schedule: InsertSchedule) => {
      return await apiRequest("POST", "/api/schedules", schedule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({
        title: "성공",
        description: "일정이 추가되었습니다.",
      });
      setIsAdding(false);
      setNewSchedule({
        title: "",
        date: "",
        time: "",
        endTime: "",
        description: "",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "일정 추가에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Delete schedule mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/schedules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({
        title: "성공",
        description: "일정이 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "일정 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!newSchedule.title || !newSchedule.date || !newSchedule.time) {
      toast({
        title: "알림",
        description: "제목, 날짜, 시간은 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }
    createScheduleMutation.mutate(newSchedule);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
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
        <h1 className="text-3xl font-bold text-gray-900">일정 관리</h1>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          일정 추가
        </Button>
      </div>

      {/* Add Schedule Form */}
      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>새 일정 추가</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={newSchedule.title}
                onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                placeholder="예: 3학년 2반 수학 수업"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">날짜 *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="time">시작 시간 *</Label>
                <Input
                  id="time"
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endTime">종료 시간</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newSchedule.endTime || ""}
                  onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value || undefined })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={newSchedule.description || ""}
                onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value || undefined })}
                placeholder="추가 설명이나 준비사항을 입력하세요"
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleSubmit}
                disabled={createScheduleMutation.isPending}
              >
                {createScheduleMutation.isPending ? "추가 중..." : "추가"}
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedules List */}
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">일정이 없습니다</h3>
              <p className="text-gray-500 mb-4">첫 번째 일정을 추가해보세요.</p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                일정 추가
              </Button>
            </CardContent>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {schedule.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(schedule.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {schedule.time}
                          {schedule.endTime && ` - ${schedule.endTime}`}
                        </span>
                      </div>
                    </div>
                    
                    {schedule.description && (
                      <p className="text-gray-600 text-sm mt-2">
                        {schedule.description}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteScheduleMutation.mutate(schedule.id)}
                    disabled={deleteScheduleMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
