import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      plan: string;
      onboardingDone: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    plan: string;
    onboardingDone: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    plan: string;
    onboardingDone: boolean;
  }
}
