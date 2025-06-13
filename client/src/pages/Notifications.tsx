import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Info, CheckCircle, Clock, Trash2, Plus } from "lucide-react";
import type { Notification } from "@shared/schema";

export default function Notifications() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts'>('all');

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  // Risk assessment mutation
  const assessRiskMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/assess-risk");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "위험도 평가 완료",
        description: "학생 위험도가 업데이트되고 알림이 생성되었습니다.",
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

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "성공",
        description: "알림이 삭제되었습니다.",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'reminder': return <Clock className="h-5 w-5 text-purple-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-red-100 border-red-200';
      case 'warning': return 'bg-yellow-100 border-yellow-200';
      case 'info': return 'bg-blue-100 border-blue-200';
      case 'reminder': return 'bg-purple-100 border-purple-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'alerts') return notification.type === 'alert' || notification.type === 'warning';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const alertCount = notifications.filter(n => n.type === 'alert' || n.type === 'warning').length;

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
        <h1 className="text-3xl font-bold text-gray-900">스마트 알림</h1>
        <Button 
          onClick={() => assessRiskMutation.mutate()}
          disabled={assessRiskMutation.isPending}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          위험도 재평가
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          전체 ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
          size="sm"
        >
          읽지 않음 ({unreadCount})
        </Button>
        <Button
          variant={filter === 'alerts' ? 'default' : 'outline'}
          onClick={() => setFilter('alerts')}
          size="sm"
        >
          중요 알림 ({alertCount})
        </Button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? '알림이 없습니다' :
               filter === 'unread' ? '읽지 않은 알림이 없습니다' :
               '중요 알림이 없습니다'}
            </h3>
            <p className="text-gray-500 mb-4">
              위험도 재평가를 실행하면 새로운 알림이 생성될 수 있습니다.
            </p>
            <Button 
              onClick={() => assessRiskMutation.mutate()}
              disabled={assessRiskMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              위험도 평가 실행
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`${getNotificationColor(notification.type)} ${!notification.isRead ? 'border-l-4' : ''}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        {!notification.isRead && (
                          <Badge variant="secondary" className="text-xs">새로운</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {notification.type === 'alert' ? '긴급' :
                           notification.type === 'warning' ? '경고' :
                           notification.type === 'reminder' ? '알림' : '정보'}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-2">{notification.message}</p>
                      {notification.relatedEntity && (
                        <p className="text-sm text-gray-500">관련: {notification.relatedEntity}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(notification.scheduledFor).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotificationMutation.mutate(notification.id)}
                      disabled={deleteNotificationMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {notifications.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>알림 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="text-sm text-gray-600">
                <p>• 위험도 재평가: 학생들의 성적과 행동 기록을 분석하여 위험도를 업데이트합니다</p>
                <p>• 읽음 처리: 확인한 알림은 자동으로 읽음 상태로 변경됩니다</p>
                <p>• 자동 알림: 위험도가 높아진 학생에 대해 자동으로 알림이 생성됩니다</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}