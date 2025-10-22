import styled from '@emotion/styled';
import { Box, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';

// 좌측 고정 사이드메뉴
export const StyledSideMenu = styled(Box)({
    position: 'fixed',
    left: 0,
    top: 0,
    width: '105px',
    height: '100vh',
    background: 'linear-gradient(180deg, #3196f3 0%, #42a5f5 50%, #4db6ac 100%)',
    backdropFilter: 'blur(20px)',
    borderRight: 'none',
    zIndex: 1200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '16px',
    boxShadow: '3px 0 28px rgba(0, 0, 0, 0.12), inset -1px 0 0 rgba(255, 255, 255, 0.3)',
    transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
});

// 앱 로고 컨테이너
export const LogoContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '10px',
    padding: '8px',
    userSelect: 'none',
});

// 메뉴 아이템 버튼
export const MenuItemButton = styled(ListItemButton, {
    shouldForwardProp: prop => prop !== 'active',
})(({ active }) => ({
    flexDirection: 'column',
    padding: '14px 10px',
    margin: '5px 8px',
    borderRadius: '12px',
    minHeight: '90px',
    width: 'calc(100% - 16px)',
    aspectRatio: '1',
    position: 'relative',
    backgroundColor: active
        ? 'rgba(255, 255, 255, 0.98)'
        : 'rgba(255, 255, 255, 0.22)',
    border: 'none',
    boxShadow: active
        ? '0 6px 20px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(25, 118, 210, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.7)'
        : '0 2px 8px rgba(0, 0, 0, 0.08)',
    backdropFilter: active ? 'blur(10px)' : 'none',

    '&::before': {
        content: '""',
        position: 'absolute',
        left: active ? '-8px' : '-6px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: active ? '5px' : '0px',
        height: active ? '65%' : '0%',
        backgroundColor: '#ffffff',
        borderRadius: '0 6px 6px 0',
        boxShadow: active
            ? '0 0 16px rgba(255, 255, 255, 0.7), 0 0 28px rgba(255, 255, 255, 0.35)'
            : 'none',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    '&:hover': {
        backgroundColor: active
            ? 'rgba(255, 255, 255, 1)'
            : 'rgba(255, 255, 255, 0.38)',
        transform: 'translateX(2px)',
        boxShadow: active
            ? '0 8px 24px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(25, 118, 210, 0.25)'
            : '0 4px 16px rgba(0, 0, 0, 0.18)',
    },

    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
}));

// 메뉴 아이콘
export const MenuIcon = styled(ListItemIcon, {
    shouldForwardProp: prop => prop !== 'active',
})(({ active }) => ({
    justifyContent: 'center',
    minWidth: 'auto',
    marginBottom: '8px',
    color: active ? '#1e88e5' : 'rgba(255, 255, 255, 0.95)',
    filter: active ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' : 'none',
    '& svg': {
        fontSize: '36px',
    },
    transition: 'color 0.4s cubic-bezier(0.4, 0, 0.2, 1), filter 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
}));

// 메뉴 텍스트
export const MenuText = styled(ListItemText, {
    shouldForwardProp: prop => prop !== 'active',
})(({ active }) => ({
    margin: 0,
    '& .MuiListItemText-primary': {
        fontSize: '12px',
        fontWeight: active ? 700 : 600,
        textAlign: 'center',
        color: active ? '#1976d2' : 'rgba(255, 255, 255, 0.98)',
        lineHeight: 1.3,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textShadow: active ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.25)',
        transition: 'color 0.4s cubic-bezier(0.4, 0, 0.2, 1), text-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },
}));


