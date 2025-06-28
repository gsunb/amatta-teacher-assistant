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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, List, CalendarDays, Check, ChevronLeft, ChevronRight, Edit, Filter } from "lucide-react";
import type { Schedule, InsertSchedule } from "@shared/schema";

export default function Schedules() {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("timeline");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCompleted, setShowCompleted] = useState(false);
  const [newSchedule, setNewSchedule] = useState<InsertSchedule>({
    title: "",
    date: "",
    time: "",
    endTime: "",
    description: "",
    category: "일반",
    categoryColor: "#3B82F6",
    isCompleted: false,
    isRecurring: false,
    recurringType: undefined,
    recurringEndDate: "",
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

  // Complete schedule mutation
  const completeScheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("PATCH", `/api/schedules/${id}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/schedules/upcoming"] });
      toast({
        title: "성공",
        description: "일정이 완료되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "일정 완료에 실패했습니다.",
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
      queryClient.invalidateQueries({ queryKey: ["/api/schedules/upcoming"] });
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
    if (!newSchedule.title || !newSchedule.date) {
      toast({
        title: "알림",
        description: "제목과 날짜는 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }
    createScheduleMutation.mutate(newSchedule);
  };

  const categoryOptions = [
    { value: "일반", color: "#3B82F6" },
    { value: "수업", color: "#10B981" },
    { value: "회의", color: "#F59E0B" },
    { value: "상담", color: "#EF4444" },
    { value: "행사", color: "#8B5CF6" },
    { value: "개인", color: "#6B7280" },
  ];

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeekNumber = (date: Date) => {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil(days / 7);
  };

  // Group schedules by date for timeline view
  const groupedSchedules = schedules.reduce((groups: { [key: string]: Schedule[] }, schedule) => {
    const date = schedule.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(schedule);
    return groups;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedSchedules).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  // Generate calendar grid for current month
  const generateCalendarDays = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Filter schedules based on completion status
  const filteredSchedules = showCompleted ? schedules : schedules.filter(s => !s.isCompleted);

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
                <Label htmlFor="time">시작 시간</Label>
                <Input
                  id="time"
                  type="time"
                  value={newSchedule.time ?? ""}
                  onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value || undefined })}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">카테고리</Label>
                <Select 
                  value={newSchedule.category} 
                  onValueChange={(value) => {
                    const selectedCategory = categoryOptions.find(c => c.value === value);
                    setNewSchedule({ 
                      ...newSchedule, 
                      category: value,
                      categoryColor: selectedCategory?.color || "#3B82F6"
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span>{category.value}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={newSchedule.isRecurring || false}
                  onCheckedChange={(checked) => setNewSchedule({ ...newSchedule, isRecurring: checked })}
                />
                <Label htmlFor="recurring">반복 일정</Label>
              </div>
            </div>

            {newSchedule.isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div>
                  <Label htmlFor="recurringType">반복 주기</Label>
                  <Select 
                    value={newSchedule.recurringType || ""} 
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, recurringType: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="반복 주기 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">매일</SelectItem>
                      <SelectItem value="weekly">매주</SelectItem>
                      <SelectItem value="monthly">매월</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recurringEndDate">반복 종료일</Label>
                  <Input
                    id="recurringEndDate"
                    type="date"
                    value={newSchedule.recurringEndDate || ""}
                    onChange={(e) => setNewSchedule({ ...newSchedule, recurringEndDate: e.target.value || undefined })}
                  />
                </div>
              </div>
            )}

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

      {/* View Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="timeline" className="flex items-center space-x-2">
            <List className="h-4 w-4" />
            <span>타임라인 뷰</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4" />
            <span>캘린더 뷰</span>
          </TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline">
          <div className="space-y-4">
            {schedules.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">일정이 없습니다</h3>
                  <p className="text-gray-500 mb-4">첫 번째 일정을 추가해보세요.</p>
                  <Button onClick={() => setIsAdding(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    일정 추가
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {sortedDates.map((date) => (
                  <div key={date} className="relative">
                    {/* Date Header */}
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {formatDate(date)}
                      </div>
                      <div className="flex-1 h-px bg-gray-200 ml-4"></div>
                    </div>
                    
                    {/* Schedules for this date */}
                    <div className="space-y-3 ml-4">
                      {groupedSchedules[date].map((schedule) => (
                        <Card key={schedule.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                  {schedule.title}
                                </h3>
                                
                                {schedule.time && (
                                  <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {schedule.time}
                                      {schedule.endTime && ` - ${schedule.endTime}`}
                                    </span>
                                  </div>
                                )}
                                
                                {schedule.description && (
                                  <p className="text-gray-600 text-sm">
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
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Day headers */}
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                  const dateStr = day.toISOString().split('T')[0];
                  const daySchedules = groupedSchedules[dateStr] || [];
                  const isCurrentMonth = day.getMonth() === new Date().getMonth();
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  
                  return (
                    <div 
                      key={index} 
                      className={`
                        p-2 h-24 border border-gray-200 overflow-hidden
                        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                        ${isToday ? 'bg-blue-50 border-blue-300' : ''}
                      `}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                        {day.getDate()}
                      </div>
                      
                      {daySchedules.slice(0, 2).map((schedule) => (
                        <div 
                          key={schedule.id}
                          className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 mb-1 truncate cursor-pointer hover:bg-blue-200"
                          title={`${schedule.title} ${schedule.time ? `(${schedule.time})` : ''}`}
                        >
                          {schedule.time && (
                            <span className="font-medium">{schedule.time.substring(0, 5)} </span>
                          )}
                          {schedule.title}
                        </div>
                      ))}
                      
                      {daySchedules.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{daySchedules.length - 2}개 더
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mt-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-50 border border-blue-300 rounded"></div>
                  <span>오늘</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-100 rounded"></div>
                  <span>일정 있음</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
