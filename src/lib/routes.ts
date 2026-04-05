export const ROUTES = {
  home: '/',
  login: '/login',
  signUp: '/sign-up',
  templates: '/templates',
  dashboard: '/dashboard',
  step1: '/Job-basic-info',
  step2Upload: '/resume-details',
  step2LinkedIn: '/linkedin-import',
  step2Scratch: '/build-from-scratch',
  step3: '/template',
  step4: '/confirm-details',
  step5: '/preview-download',
  privacy: '/privacy',
  contact: '/contact',
} as const;

export const LEGACY_ROUTES = {
  auth: '/auth',
  step1: '/step1',
  step2Upload: '/step2-upload',
  step2LinkedIn: '/step2-linkedin',
  step2Scratch: '/step2-scratch',
  step3: '/step3',
  step4: '/step4',
  step5: '/step5',
} as const;
