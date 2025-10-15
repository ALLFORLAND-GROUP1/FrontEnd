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
          if (inputValue.trim() !== "") setOpen(true); // 입력이 있을 때만 열기
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
        renderOption={(props, option) => (
  <Box
    component="li"
    {...props}
    key={`${option.name}-${option.ho}`} // ✅ 고유 key
    sx={{
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
    }}
  >
    <Typography variant="body2">{option.name}</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
      {option.ho}호선
    </Typography>
  </Box>
)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="역 이름 입력"
            variant="outlined"
            size="small"
            sx={{
              '& .MuiInputBase-root': {
                height: 36,
              },
              '& .MuiInputBase-input': {
                padding: '6px 8px',
                boxSizing: 'border-box',
              },
              '& .MuiInputLabel-root': {
                top: '0x',
                fontSize: '0.9rem',
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
