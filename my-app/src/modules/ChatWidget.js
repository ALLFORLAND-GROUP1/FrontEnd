import { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Divider,
  Stack,
  Tooltip,
  Avatar,
  Chip
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";

/**
 * props:
 *  - botMessage: string | undefined
 */
function ChatWidget({ botMessage, infoMessage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLLMLoading, setIsLLMLoading] = useState(false); // LLM 응답 대기 상태
  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { text: input, sender: "me", time: timeString }]);
    setInput("");
  };

  // 스크롤 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  // 외부(bot) 메시지 수신
  useEffect(() => {
    if (botMessage) {
      setIsLLMLoading(false); // 응답 도착 시 타이핑 종료
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [...prev, { text: botMessage, sender: "other", time: timeString }]);
      // 새 메시지 오면 자동으로 위젯 펼치고 싶다면 아래 주석 해제
      setIsOpen(true);
    }
  }, [botMessage]);

  useEffect(() => {
    if (infoMessage) {
      setIsLLMLoading(true); // 사용자가 역 선택 시 타이핑 시작
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [...prev, { text: infoMessage, sender: "me", time: timeString }]);
      // 새 메시지 오면 자동으로 위젯 펼치고 싶다면 아래 주석 해제
      setIsOpen(true);
    }
  }, [infoMessage]);

  return (
    <Paper
      elevation={12}
      sx={{
        position: "fixed",
        right: 12,
        bottom: 8,
        width: 400,
        height: 500,
        borderRadius: "20px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: (theme) => theme.transitions.create(["transform", "box-shadow"], {
          duration: 400,
          easing: theme.transitions.easing.easeInOut
        }),
        transform: isOpen ? "translateY(0) scale(1)" : "translateY(calc(100% - 70px)) scale(0.98)",
        zIndex: 1300,
        bgcolor: "background.paper",
        boxShadow: isOpen
          ? "0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)"
          : "0 8px 24px rgba(0,0,0,0.15)",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {/* 헤더 */}
      <Box
        onClick={() => setIsOpen((v) => !v)}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "common.white",
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          userSelect: "none",
          transition: "all 0.3s ease",
          "&:hover": {
            background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
          }
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: "rgba(255,255,255,0.25)",
            mr: 1.5,
          }}
        >
          <SmartToyIcon sx={{ color: "white", fontSize: 22 }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            점수 측정 AI 어시스턴트
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.75rem" }}>
            실시간 혼잡도 & 주변환경 기반 분석
          </Typography>
        </Box>
        <Chip
          label={isOpen ? "최소화" : "채팅"}
          size="small"
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            color: "white",
            fontWeight: 600,
            mr: 1,
            fontSize: "0.7rem",
          }}
        />
        <IconButton
          size="small"
          sx={{
            color: "common.white",
            bgcolor: "rgba(255,255,255,0.15)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
          }}
        >
          {isOpen ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: "rgba(0,0,0,0.08)" }} />

      {/* 메시지 리스트 */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2.5,
          background: "linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.2)",
            borderRadius: "4px",
            "&:hover": {
              background: "rgba(0,0,0,0.3)",
            }
          }
        }}
      >
        <Stack spacing={2}>
          {messages.map((msg, idx) => {
            const mine = msg.sender === "me";
            return (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent: mine ? "flex-end" : "flex-start",
                  alignItems: "flex-end",
                  gap: 1,
                  animation: "slideIn 0.3s ease-out",
                  "@keyframes slideIn": {
                    from: {
                      opacity: 0,
                      transform: "translateY(10px)"
                    },
                    to: {
                      opacity: 1,
                      transform: "translateY(0)"
                    }
                  }
                }}
              >
                {!mine && (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      mb: 0.5,
                    }}
                  >
                    <SmartToyIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                )}
                <Box sx={{ maxWidth: "75%" }}>
                  <Paper
                    elevation={mine ? 2 : 1}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: mine
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "white",
                      color: mine ? "white" : "text.primary",
                      boxShadow: mine
                        ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                        : "0 2px 8px rgba(0,0,0,0.08)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: mine
                          ? "0 6px 16px rgba(102, 126, 234, 0.4)"
                          : "0 4px 12px rgba(0,0,0,0.12)",
                      }
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        lineHeight: 1.6,
                        fontSize: "0.9rem"
                      }}
                    >
                      {msg.text}
                    </Typography>
                  </Paper>
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      display: "block",
                      color: "text.secondary",
                      textAlign: mine ? "right" : "left",
                      fontSize: "0.7rem",
                      opacity: 0.7
                    }}
                  >
                    {msg.time}
                  </Typography>
                </Box>
                {mine && (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "grey.300",
                      mb: 0.5,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 18, color: "grey.700" }} />
                  </Avatar>
                )}
              </Box>
            );
          })}

          {/* LLM 점수 분석 중 애니메이션 */}
          {isLLMLoading && (
            <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end", gap: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  mb: 0.5,
                }}
              >
                <SmartToyIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box sx={{ maxWidth: "75%" }}>
                <Paper
                  elevation={1}
                  sx={{
                    px: 2.5,
                    py: 2,
                    borderRadius: "18px 18px 18px 4px",
                    bgcolor: "white",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1.5,
                    boxShadow: "0 2px 12px rgba(102, 126, 234, 0.2)",
                  }}
                >
                  <Typography
                    fontSize={14}
                    sx={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: "bold",
                      mr: 0.5
                    }}
                  >
                    점수 분석 중
                  </Typography>
                  <Box sx={{ display: "inline-flex", gap: 0.6 }}>
                    {[0, 1, 2].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          animation: "typing 1.4s infinite",
                          animationDelay: `${i * 0.2}s`,
                          "@keyframes typing": {
                            "0%, 60%, 100%": {
                              opacity: 0.3,
                              transform: "translateY(0) scale(1)",
                            },
                            "30%": {
                              opacity: 1,
                              transform: "translateY(-10px) scale(1.2)",
                            },
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      <Divider sx={{ borderColor: "rgba(0,0,0,0.08)" }} />

      {/* 입력 영역 */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          gap: 1.5,
          alignItems: "center",
          bgcolor: "white",
          borderTop: "1px solid rgba(0,0,0,0.06)"
        }}
      >
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="메시지를 입력하세요..."
          size="small"
          fullWidth
          variant="outlined"
          sx={{
            bgcolor: "grey.50",
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "grey.100",
              },
              "&.Mui-focused": {
                bgcolor: "white",
                boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.2)",
              }
            },
          }}
        />
        <Tooltip title="전송" arrow>
          <span>
            <IconButton
              color="primary"
              onClick={sendMessage}
              disabled={!input.trim()}
              sx={{
                background: input.trim()
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "grey.200",
                color: "white",
                width: 44,
                height: 44,
                transition: "all 0.3s ease",
                "&:hover": {
                  background: input.trim()
                    ? "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)"
                    : "grey.200",
                  transform: input.trim() ? "scale(1.05)" : "none",
                  boxShadow: input.trim() ? "0 4px 12px rgba(102, 126, 234, 0.4)" : "none",
                },
                "&.Mui-disabled": {
                  bgcolor: "grey.200",
                  color: "grey.400"
                }
              }}
              aria-label="전송"
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
}

export default ChatWidget;
