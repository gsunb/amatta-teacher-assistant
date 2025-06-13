import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: '안녕하세요! 선생님의 AI 상담사입니다. 업무 관련 질문이나 도움이 필요한 일이 있으시면 언제든 말씀해주세요.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response (in real implementation, this would call Gemini API)
    setTimeout(() => {
      const responses = getChatBotResponse(inputMessage);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: responses,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const getChatBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    // Parent communication responses
    if (lowerInput.includes('학부모') || lowerInput.includes('부모')) {
      return '학부모와의 소통에 대한 조언을 드리겠습니다:\n\n1. 구체적이고 객관적인 사실을 먼저 전달하세요\n2. 학생의 긍정적인 면도 함께 언급해주세요\n3. 협력적인 해결 방안을 제시하세요\n4. 정기적인 소통 채널을 열어두세요\n\n더 구체적인 상황을 알려주시면 맞춤형 조언을 드릴 수 있습니다.';
    }

    // Priority and time management
    if (lowerInput.includes('우선순위') || lowerInput.includes('시간') || lowerInput.includes('관리')) {
      return '업무 우선순위 설정 방법을 제안드립니다:\n\n1. 긴급도와 중요도로 분류하세요\n2. 학생 안전 관련 업무를 최우선으로\n3. 수업 준비와 평가 업무를 두 번째로\n4. 행정 업무는 여유 시간에 처리\n5. Amatta의 일정 관리 기능을 활용해보세요\n\n현재 어떤 업무로 고민이시신가요?';
    }

    // Amatta feature guidance
    if (lowerInput.includes('amatta') || lowerInput.includes('아마타') || lowerInput.includes('기능') || lowerInput.includes('사용법')) {
      return 'Amatta 기능 안내:\n\n• 일정 관리: 수업, 회의, 상담 일정을 체계적으로 관리\n• 사건 기록: 학급 내 중요한 사건들을 기록하고 추적\n• 성과 평가: 학생들의 학업 성과를 업로드하고 분석\n• 학생 명단: Excel/CSV로 학생 정보를 간편하게 관리\n• 자연어 명령: "내일 수업 일정 추가해줘" 같은 명령 사용\n\n어떤 기능에 대해 더 자세히 알고 싶으신가요?';
    }

    // Student management
    if (lowerInput.includes('학생') || lowerInput.includes('학급')) {
      return '학급 관리에 대한 조언:\n\n1. 개별 학생의 특성과 니즈를 파악하세요\n2. 긍정적 강화를 활용한 동기부여\n3. 명확하고 일관된 규칙 설정\n4. 학생들과의 신뢰 관계 구축\n5. 정기적인 개별 면담 실시\n\n구체적인 학급 관리 상황이 있으시면 더 자세한 조언을 드릴 수 있습니다.';
    }

    // Default responses
    const defaultResponses = [
      '좋은 질문이네요! 더 구체적인 상황을 설명해주시면 맞춤형 조언을 드릴 수 있습니다.',
      '선생님의 상황을 이해했습니다. 이런 방법들을 고려해보시는 것은 어떨까요?',
      '교육 현장에서 자주 마주치는 고민이시군요. 단계별로 접근해보시면 좋을 것 같습니다.',
      '훌륭한 관점입니다! 학생들의 입장에서도 생각해보시면 더 좋은 해결책을 찾을 수 있을 것 같아요.'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Widget Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-xl z-50 flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <Bot className="h-4 w-4 text-primary" />
                <span>AI 상담사</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4 pt-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 pr-2 mb-4" ref={scrollAreaRef}>
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'bot' && (
                          <Bot className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                        )}
                        {message.type === 'user' && (
                          <User className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-3 w-3 text-primary" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="flex-1 text-sm"
                disabled={isTyping}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                size="sm"
                className="px-3"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}