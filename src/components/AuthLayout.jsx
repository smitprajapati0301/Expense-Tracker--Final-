import React from 'react';
import { AppBar, Box, Container, Grid, Paper, Stack, Toolbar, Typography } from '@mui/material';
import track from '../assets/1.png';

const featureItems = [
  'Firebase email and Google sign-in',
  'Clean expense tracking workflow',
  'Responsive layout for mobile and desktop',
];

export default function AuthLayout({ title, subtitle, children, eyebrow, helperTitle, helperText }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(255, 180, 120, 0.18), transparent 30%), radial-gradient(circle at bottom right, rgba(93, 120, 255, 0.18), transparent 28%), linear-gradient(180deg, #08111f 0%, #0e1729 50%, #eef2ff 100%)',
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'rgba(6, 10, 18, 0.72)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Toolbar sx={{ minHeight: 76 }}>
          <Box component="a" href="/" sx={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <Box component="img" src={track} alt="Trackify" sx={{ height: 34, width: 'auto' }} />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack spacing={3} sx={{ color: '#f8fbff', pr: { md: 4 } }}>
              <Typography variant="overline" sx={{ letterSpacing: 2, color: 'rgba(255,255,255,0.72)' }}>
                {eyebrow || 'Expense Tracker'}
              </Typography>
              <Typography component="h1" variant="h2" sx={{ fontWeight: 800, lineHeight: 1.03 }}>
                {title}
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(248,251,255,0.78)', maxWidth: 520, fontWeight: 400 }}>
                {subtitle}
              </Typography>

              <Stack spacing={1.5} sx={{ pt: 1 }}>
                {featureItems.map((item) => (
                  <Typography key={item} sx={{ color: 'rgba(248,251,255,0.85)' }}>
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={24}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 5,
                overflow: 'hidden',
                bgcolor: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(18px)',
                border: '1px solid rgba(15, 23, 42, 0.08)',
              }}
            >
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>
                    {helperTitle || 'Secure access'}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#0f172a' }}>
                    {title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
                    {helperText || subtitle}
                  </Typography>
                </Box>

                {children}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
