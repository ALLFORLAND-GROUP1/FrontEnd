import { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Divider,
  Stack,
  Tooltip
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

/**
 * props:
 *  - botMessage: string | undefined
 */
function ChatWidget({ botMessage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
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
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [...prev, { text: botMessage, sender: "other", time: timeString }]);
      // 새 메시지 오면 자동으로 위젯 펼치고 싶다면 아래 주석 해제
      setIsOpen(true);
    }
  }, [botMessage]);

  return (
    <Paper
      elevation={6}
      sx={{
        position: "fixed",
        right: 20,
        bottom: 0,
        width: 360,
        height: 520,
        borderRadius: "12px 12px 0 0",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: (theme) => theme.transitions.create("transform", { duration: 300 }),
        transform: isOpen ? "translateY(0)" : "translateY(calc(100% - 44px))", // 헤더만 보이도록
        zIndex: 1300,
        bgcolor: "background.paper",
        // border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* 헤더 */}
      <Box
        onClick={() => setIsOpen((v) => !v)}
        sx={{
          bgcolor: "grey.900",
          color: "common.white",
          px: 1.5,
          py: 1,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
          채팅
        </Typography>
        <IconButton
          size="small"
          sx={{
            color: "common.white",
            "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
          }}
        >
          {isOpen ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Box>

      <Divider />

      {/* 메시지 리스트 */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 1.5, bgcolor: "grey.50" }}>
        <Stack spacing={1}>
          {messages.map((msg, idx) => {
            const mine = msg.sender === "me";
            return (
              <Box key={idx} sx={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                <Box sx={{ maxWidth: "80%" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 2,
                      bgcolor: mine ? "primary.main" : "grey.200",
                      color: mine ? "primary.contrastText" : "text.primary",
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {msg.text}
                    </Typography>
                  </Paper>
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.25, display: "block", color: "text.secondary", textAlign: mine ? "right" : "left" }}
                  >
                    {msg.time}
                  </Typography>
                </Box>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      <Divider />

      {/* 입력 영역 */}
      <Box sx={{ p: 1, display: "flex", gap: 1, alignItems: "center", bgcolor: "background.paper" }}>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="메시지를 입력하세요"
          size="small"
          fullWidth
          variant="outlined"
          sx={{
            bgcolor: "common.white",
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
        <Tooltip title="전송">
          <span>
            <IconButton
              color="primary"
              onClick={sendMessage}
              disabled={!input.trim()}
              sx={{
                bgcolor: "common.white",
                border: (theme) => `1px solid ${theme.palette.divider}`,
                "&:hover": { bgcolor: "grey.100" },
              }}
              aria-label="전송"
            >
              <SendIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
}

export default ChatWidget;
