import * as jose from 'jose';

export type Session = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  //   accessToken: string;
  //   refreshToken: string;
};

export const createSession = async (payload: Session) => {
  // Create a new session in the database or any other storage
  // You can use the payload to store user information
  const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const session = await new jose.SignJWT(payload)
    .setProtectedHeader({
      alg: 'HS256',
      typ: 'JWT',
    })
    .setIssuedAt()
    .setExpirationTime(expiredAt)
    .sign(new TextEncoder().encode(process.env.NEXTAUTH_SECRET));
};
