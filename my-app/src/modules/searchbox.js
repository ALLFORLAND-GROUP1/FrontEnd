import { useState } from "react";
import { Autocomplete, TextField, Box, Typography } from "@mui/material";

function SearchBox({ markers, onSelect }) {
  const [inputValue, setInputValue] = useState("");
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false); // ✅ 옵션창 열림 상태 제어

  // ✅ 역명 오름차순으로 정렬된 옵션
  const sortedMarkers = [...markers].sort((a, b) =>
    a.name.localeCompare(b.name, "ko") // 한글 정렬도 정상 작동
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Autocomplete
        fullWidth
        options={sortedMarkers}
        open={open} // ✅ 수동 제어
        onOpen={() => {
          setOpen(true)
          // if (inputValue.trim() !== "") setOpen(true); // 입력이 있을 때만 열기
        }}
        onClose={() => setOpen(false)}
        getOptionLabel={(option) => option.name || ""}
        value={selected}
        inputValue={inputValue}
        filterOptions={(options, state) =>
          options.filter((option) =>
            option.name
              .toLowerCase()
              .startsWith(state.inputValue.toLowerCase()) // ✅ 앞글자 일치만 허용
          )
        }
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
          setOpen(newInputValue.trim() !== ""); // ✅ 입력 없으면 닫기
        }}
        onChange={(event, newValue) => {
          setSelected(newValue);
          if (newValue) {
            onSelect(newValue);
            setInputValue(newValue.name);
            setOpen(false); // ✅ 선택 시 닫기
          }
        }}
        renderOption={(props, option) => {
          // 호선별 색상 매핑
          const lineColors = {
            '1': '#0052a4',
            '2': '#00a84d',
            '3': '#ef7c1c',
            '4': '#00a5de',
            '5': '#996cac',
            '6': '#cd7c2f',
            '7': '#747f00',
            '8': '#e6186c',
            '9': '#bdb092'
          };
          const lineColor = lineColors[option.ho] || '#666';

          return (
            <Box
              component="li"
              {...props}
              key={`${option.name}-${option.ho}`}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                py: 1.5,
                px: 2,
                borderBottom: '1px solid rgba(0,0,0,0.04)',
                '&:last-child': {
                  borderBottom: 'none',
                },
                '&:hover': {
                  bgcolor: 'rgba(59, 130, 246, 0.04)',
                },
                '&.Mui-focused': {
                  bgcolor: 'rgba(59, 130, 246, 0.08)',
                }
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>
                {option.name}
              </Typography>
              <Box sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: '8px',
                bgcolor: lineColor,
                ml: 2
              }}>
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>
                  {option.ho}호선
                </Typography>
              </Box>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="역 이름 입력"
            placeholder="예: 양천향교역"
            variant="outlined"
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: 'white',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: '2px',
                }
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.95rem',
                '&.Mui-focused': {
                  color: '#3b82f6',
                }
              },
            }}
          />
        )}
        sx={{ width: "100%" }}
      />
    </Box>
  );
}

export default SearchBox;
