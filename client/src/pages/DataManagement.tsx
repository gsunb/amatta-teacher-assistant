import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Database, Shield, Clock, CheckCircle, AlertCircle } from "lucide-react";
import type { Backup } from "@shared/schema";

export default function DataManagement() {
  const { toast } = useToast();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  // Fetch backups
  const { data: backups = [], isLoading } = useQuery<Backup[]>({
    queryKey: ["/api/backups"],
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/backup/create");
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/backups"] });
      
      // Download the backup file
      const backupData = JSON.stringify(data.data, null, 2);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `amatta_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "백업 완료",
        description: "데이터 백업이 생성되어 다운로드되었습니다.",
      });
      setIsCreatingBackup(false);
    },
    onError: (error: Error) => {
      toast({
        title: "백업 실패",
        description: error.message,
        variant: "destructive",
      });
      setIsCreatingBackup(false);
    },
  });

  const handleCreateBackup = () => {
    setIsCreatingBackup(true);
    createBackupMutation.mutate();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold text-gray-900">데이터 관리</h1>
        <Button 
          onClick={handleCreateBackup}
          disabled={isCreatingBackup || createBackupMutation.isPending}
        >
          <Database className="h-4 w-4 mr-2" />
          {isCreatingBackup ? "백업 생성 중..." : "새 백업 생성"}
        </Button>
      </div>

      {/* Data Protection Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">데이터 보안</h3>
                <p className="text-sm text-gray-600">모든 데이터는 암호화되어 안전하게 저장됩니다</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">자동 백업</h3>
                <p className="text-sm text-gray-600">중요 데이터는 자동으로 백업됩니다</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Download className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">데이터 내보내기</h3>
                <p className="text-sm text-gray-600">언제든지 데이터를 다운로드할 수 있습니다</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Progress */}
      {isCreatingBackup && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Database className="h-6 w-6 text-blue-600 animate-pulse" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">백업 생성 중...</p>
                <p className="text-sm text-gray-600">데이터를 수집하고 압축하고 있습니다</p>
                <Progress value={65} className="w-full mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>백업 기록</CardTitle>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">백업 기록이 없습니다</h3>
              <p className="text-gray-500 mb-4">첫 번째 백업을 생성해보세요.</p>
              <Button onClick={handleCreateBackup} disabled={isCreatingBackup}>
                <Database className="h-4 w-4 mr-2" />
                첫 백업 생성
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(backup.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{backup.fileName}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{new Date(backup.createdAt!).toLocaleString('ko-KR')}</span>
                        {backup.fileSize && (
                          <span>{formatFileSize(backup.fileSize)}</span>
                        )}
                        <Badge className={getStatusColor(backup.status)}>
                          {backup.status === 'completed' ? '완료' :
                           backup.status === 'pending' ? '진행 중' :
                           backup.status === 'failed' ? '실패' : backup.status}
                        </Badge>
                        <Badge variant="outline">
                          {backup.backupType === 'manual' ? '수동' : '자동'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {backup.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // In a real implementation, this would download the specific backup file
                        toast({
                          title: "정보",
                          description: "백업 파일 재다운로드 기능은 준비 중입니다.",
                        });
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      다운로드
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management Guidelines */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>데이터 관리 가이드라인</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">백업 주기</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>주요 데이터 변경 후 즉시 백업 권장</li>
                <li>월 1회 정기 백업 실시</li>
                <li>학기말/학년말 필수 백업</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">데이터 보안</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>백업 파일은 안전한 위치에 보관</li>
                <li>개인정보가 포함된 데이터 주의</li>
                <li>정기적인 비밀번호 변경 권장</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">복원 절차</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>데이터 손실 시 즉시 관리자에게 연락</li>
                <li>최신 백업 파일 확인</li>
                <li>단계별 복원 절차 준수</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}